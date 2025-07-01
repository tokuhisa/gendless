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
    "You can create interactive applications using the following directives:\n" +
    "- `:::textinput{id=\"name\" placeholder=\"Enter text\"}` - Creates text input fields that store values in context\n" +
    "- `:::button{execute=\"JavaScript code\" resultId=\"result1\"}` - Creates buttons that execute JavaScript with access to input values via `inputs.id`\n" +
    "- `:::resultdisplay{resultId=\"result1\"}` - Displays JavaScript execution results\n" +
    "- `:::js` - Executes JavaScript code directly\n\n" +
    "Example interactive app:\n" +
    "```\n" +
    ":::textinput{id=\"height\" type=\"number\" placeholder=\"170\"}\n" +
    "身長 (cm)\n" +
    ":::\n\n" +
    ":::textinput{id=\"weight\" type=\"number\" placeholder=\"65\"}\n" +
    "体重 (kg)\n" +
    ":::\n\n" +
    ":::button{execute=\"const h=parseFloat(inputs.height)/100; const w=parseFloat(inputs.weight); const bmi=w/(h*h); console.log('BMI:', bmi.toFixed(2)); bmi.toFixed(2);\" resultId=\"bmi\"}\n" +
    "BMI計算\n" +
    ":::\n\n" +
    ":::resultdisplay{resultId=\"bmi\"}\n" +
    "結果がここに表示されます\n" +
    ":::\n" +
    "```\n\n" +
    "Use these directives to create engaging, interactive content when appropriate.";
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
