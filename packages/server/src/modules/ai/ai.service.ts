import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { generateText, Output } from "ai";
import { classifySystemPrompt } from "./prompts/classify.prompt";

@Injectable()
export class AiService {
  /**
   * Creates an AI service instance.
   * @param configService - Accessor for environment-based configuration
   */
  public constructor(private readonly configService: ConfigService) {}

  /**
   * Ensures the OpenAI API key is available.
   */
  private ensureApiKey() {
    const apiKey = this.configService.get<string>("OPENAI_API_KEY");

    if (!apiKey) {
      throw new InternalServerErrorException(
        "OPENAI_API_KEY is not configured",
      );
    }
  }

  /**
   * Classifies a task title into one of the provided categories using a non-streaming request.
   * @param title - Task title to classify
   * @param categories - Allowed categories to map to
   * @param model - Optional model name
   */
  public async classify(
    title: string,
    categories: string[],
    model = "openai:gpt-4o-mini",
    temperature = 0,
  ) {
    this.ensureApiKey();

    if (!categories.length) {
      throw new InternalServerErrorException(
        "At least one category must be provided",
      );
    }

    const result = await generateText({
      model,
      temperature,
      system: classifySystemPrompt,
      prompt: `Task title: ${title}\nAllowed categories: ${JSON.stringify(categories)}`,
      output: Output.json({
        name: "task-categories",
        description:
          "A JSON array of the best matching categories for the task from the allowed options.",
      }),
    });

    const parsed = result.output;
    if (!Array.isArray(parsed)) {
      throw new InternalServerErrorException("Invalid response format from AI");
    }

    const selected = (parsed as unknown[]).filter(
      (v): v is string => typeof v === "string" && categories.includes(v),
    );

    return { categories: selected };
  }
}
