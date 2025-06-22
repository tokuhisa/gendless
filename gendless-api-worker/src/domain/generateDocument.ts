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
    "You are a Markdown transformation assistant. You take input Markdown and a specified goal, then output Markdown that fulfills that goal.";
  const prompt =
    `Goal: ${goal}\n` +
    `Input Markdown:\n` +
    "```markdown\n" +
    inputText.trim() +
    "\n```\n" +
    "Produce: Markdown only.";
  const generationResult = await llmClient.generate(systemPrompt, prompt);
  const datetime = new Date().toISOString().replace(/[-:.TZ]/g, "");
  const outputFileName = `documents/${datetime}-${inputFileName}`;

  await storage.putObject(outputFileName, generationResult.text);

  return {
    ...generationResult,
    fileName: outputFileName,
  };
};
