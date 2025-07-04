import { LLMClient } from "../infra/LLMClient";
import { ObjectStorage } from "../infra/ObjectStorage";

export const generateDocument = async (
  env: CloudflareBindings,
  inputFileName: string,
) => {
  const storage = new ObjectStorage(env);
  const inputDoc = await storage.getObject("documents/" + inputFileName);

  if (!inputDoc) {
    throw new Error(`Document not found: ${inputFileName}`);
  }

  const inputText = await new Response(inputDoc.body).text();

  const llmClient = new LLMClient(env);
  const goal = "筋トレ初心者に役立つページを作成する";
  const systemPrompt =
    "You are a Markdown transformation assistant. You take input Markdown and a specified goal. Write your response **directly as markdown text**, using headings (#), lists (- or *), bold (**), italic (*), links, tables, etc. Begin with the top-level heading or paragraph — do not output any triple backticks or code fences around the content.\n\n" +
    "You can create interactive applications using the following directives (note the :: syntax for leaf directives):\n" +
    "- `::textinput[Label Text]{id=\"name\" placeholder=\"Enter text\" type=\"text\"}` - Creates text input fields that store values in context\n" +
    "- `::button[Button Text]{eventId=\"event1\" variant=\"primary\"}` - Creates buttons that trigger JavaScript execution by eventId\n" +
    "- `:::js{eventId=\"event1\" resultId=\"result1\"}` - Contains JavaScript code that executes when triggered by button with matching eventId\n" +
    "- `::resultdisplay[Placeholder text]{resultId=\"result1\"}` - Displays JavaScript execution results\n" +
    "- `:::js` - Executes JavaScript code directly on page load (without eventId)\n\n" +
    "Interactive workflow:\n" +
    "1. TextInput components store values accessible via `inputs.id` in JavaScript code\n" +
    "2. Button components dispatch events by eventId when clicked\n" +
    "3. JavaScript components with matching eventId execute when button is clicked\n" +
    "4. JavaScript execution results are stored by resultId\n" +
    "5. ResultDisplay components show execution results by resultId\n" +
    "6. Users can also manually execute JavaScript using the 'コードを実行' button\n\n" +
    "Directive syntax notes:\n" +
    "- Use `::` for leaf directives (textinput, button, resultdisplay)\n" +
    "- Use `:::` for container directives (js)\n" +
    "- Leaf directives use `[content]{attributes}` format\n" +
    "- Container directives use `{attributes}` followed by content block\n" +
    "- Boolean attributes like required/disabled should be strings: `required=\"true\"`\n\n" +
    "Example interactive BMI calculator:\n" +
    "```\n" +
    "::textinput[身長 (cm)]{id=\"height\" type=\"number\" placeholder=\"170\" defaultValue=\"170\"}\n\n" +
    "::textinput[体重 (kg)]{id=\"weight\" type=\"number\" placeholder=\"65\" defaultValue=\"65\"}\n\n" +
    "::button[BMI計算]{eventId=\"calculate-bmi\" variant=\"primary\"}\n\n" +
    ":::js{eventId=\"calculate-bmi\" resultId=\"bmi-result\"}\n" +
    "const height = parseFloat(inputs.height) / 100;\n" +
    "const weight = parseFloat(inputs.weight);\n" +
    "const bmi = weight / (height * height);\n" +
    "console.log('身長:', inputs.height + 'cm');\n" +
    "console.log('体重:', inputs.weight + 'kg');\n" +
    "console.log('BMI:', bmi.toFixed(2));\n" +
    "bmi.toFixed(2);\n" +
    ":::\n\n" +
    "::resultdisplay[BMI計算結果がここに表示されます]{resultId=\"bmi-result\"}\n" +
    "```\n\n" +
    "Available input types: text, email, password, number, tel, url\n" +
    "Available button variants: primary, secondary, danger, success, outline\n" +
    "Available button sizes: sm, md, lg\n\n" +
    "Use these directives to create engaging, interactive content when appropriate for the goal.";
  const prompt =
    `Goal: ${goal}\n` +
    `Input Markdown:\n` +
    "```markdown\n" +
    inputText.trim() +
    "\n```\n" +
    "Produce: Plain markdown text with interactive elements when useful, starting with a heading. No code fences around the final output."
  const generationResult = await llmClient.generate(systemPrompt, prompt);
  const datetime = new Date().toISOString().replace(/[-:.TZ]/g, "");
  const outputFileName = `documents/${datetime}-${inputFileName}`;

  await storage.putObject(outputFileName, generationResult.text);

  return {
    ...generationResult,
    fileName: outputFileName,
  };
};
