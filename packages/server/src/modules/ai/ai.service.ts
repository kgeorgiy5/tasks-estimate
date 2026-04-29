import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createOpenAI } from "@ai-sdk/openai";
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
   * Returns the OpenAI API key from configuration.
   */
  private getOpenAIApiKey() {
    const apiKey = this.configService.get<string>("OPENAI_API_KEY");

    if (!apiKey) {
      throw new InternalServerErrorException(
        "OPENAI_API_KEY is not configured",
      );
    }

    return apiKey;
  }

  /**
   * Extracts a raw categories list from model output.
   * @param output - Parsed model output
   */
  private extractRawCategories(output: unknown): unknown[] {
    if (Array.isArray(output)) {
      return output;
    }

    if (typeof output !== "object" || output === null) {
      throw new InternalServerErrorException("Invalid response format from AI");
    }

    const maybeCategories = (output as Record<string, unknown>).categories;
    if (Array.isArray(maybeCategories)) {
      return maybeCategories;
    }

    const maybeNamedCategories = (output as Record<string, unknown>)[
      "task-categories"
    ];
    if (Array.isArray(maybeNamedCategories)) {
      return maybeNamedCategories;
    }

    throw new InternalServerErrorException("Invalid response format from AI");
  }

  /**
   * Builds a normalized lookup map for allowed categories.
   * @param categories - Allowed categories
   */
  private createAllowedCategoriesMap(categories: string[]) {
    const normalized = new Map<string, string>();

    for (const category of categories) {
      normalized.set(category.trim().toLowerCase(), category);
    }

    return normalized;
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
    model = "gpt-4o-mini",
    temperature = 0,
  ) {
    const openAIApiKey = this.getOpenAIApiKey();

    if (!categories.length) {
      throw new InternalServerErrorException(
        "At least one category must be provided",
      );
    }

    const openai = createOpenAI({ apiKey: openAIApiKey });

    const result = await generateText({
      model: openai(model),
      temperature,
      system: classifySystemPrompt,
      prompt: `Task title: ${title}\nAllowed categories: ${JSON.stringify(categories)}`,
      output: Output.json({
        name: "task-categories",
        description:
          "A JSON array of the best matching categories for the task from the allowed options.",
      }),
    });

    const parsed = this.extractRawCategories(result.output);

    const allowedCategoriesMap = this.createAllowedCategoriesMap(categories);
    const selected: string[] = [];
    const selectedSet = new Set<string>();

    for (const value of parsed) {
      if (typeof value !== "string") {
        continue;
      }

      const canonicalCategory = allowedCategoriesMap.get(
        value.trim().toLowerCase(),
      );

      if (!canonicalCategory || selectedSet.has(canonicalCategory)) {
        continue;
      }

      selected.push(canonicalCategory);
      selectedSet.add(canonicalCategory);
    }

    return { categories: selected };
  }
}
