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
    "You are a Markdown transformation assistant. You take input Markdown and a specified goal. Write your response **directly as markdown text**, using headings (#), lists (- or *), bold (**), italic (*), links, tables, etc. Begin with the top-level heading or paragraph — do not output any triple backticks or code fences around the content.";
  const prompt =
    `Goal: ${goal}\n` +
    `Input Markdown:\n` +
    "```markdown\n" +
    inputText.trim() +
    "\n```\n" +
    "Produce: Plain markdown text, starting with a heading. No code fences."
  const generationResult = await llmClient.generate(systemPrompt, prompt);
  const datetime = new Date().toISOString().replace(/[-:.TZ]/g, "");
  const outputFileName = `documents/${datetime}-${inputFileName}`;

  await storage.putObject(outputFileName, generationResult.text);

  return {
    ...generationResult,
    fileName: outputFileName,
  };
};
