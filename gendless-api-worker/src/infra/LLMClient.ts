const modelName = "@cf/meta/llama-4-scout-17b-16e-instruct";
type AiInputType = Ai_Cf_Meta_Llama_4_Scout_17B_16E_Instruct_Input;
type AiOutputType = Ai_Cf_Meta_Llama_4_Scout_17B_16E_Instruct_Output;

export interface GenerationResult {
  text: string;
}

export class LLMClient {
  private ai: Ai;

  constructor(env: CloudflareBindings) {
    this.ai = env.AI;
  }

  async generate(
    systemPrompt: string,
    prompt: string,
  ): Promise<GenerationResult> {
    const input = {
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: prompt,
        },
      ],
    } satisfies AiInputType;

    const options = {} satisfies AiOptions;

    try {
      const output: AiOutputType = await this.ai.run(modelName, input, options);
      console.log("LLM Response:", output);
      if (typeof output === "string") {
        return { text: output };
      } else {
        const { response } = output;
        return {
          text: response,
        };
      }
    } catch (error) {
      console.error("Error generating response:", error);
      throw new Error("Failed to generate response from LLM");
    }
  }
}
