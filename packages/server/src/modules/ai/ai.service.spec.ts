jest.mock("ai", () => ({
  generateText: jest.fn(),
  Output: {
    json: jest.fn((config: unknown) => config),
  },
}));

import { InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { generateText, Output } from "ai";
import { AiService } from "./ai.service";
import { classifySystemPrompt } from "./prompts/classify.prompt";

describe("AiService", () => {
  const mockedGenerateText = jest.mocked(generateText);
  const mockedOutputJson = jest.mocked(Output.json);
  let configService: Pick<ConfigService, "get">;

  beforeEach(() => {
    jest.clearAllMocks();
    configService = {
      get: jest.fn().mockReturnValue("test-api-key"),
    };
  });

  it("passes the expected prompt payload and filters AI output to allowed categories", async () => {
    mockedGenerateText.mockResolvedValue({
      output: ["Bug", "Ignored", 42, "Feature"],
    } as unknown as Awaited<ReturnType<typeof generateText>>);

    const service = new AiService(configService as ConfigService);
    const categories = ["Bug", "Feature"];

    const result = await service.classify(
      "Fix broken login form",
      categories,
      "openai:gpt-4.1-mini",
      0.3,
    );

    expect(result).toEqual({ categories: ["Bug", "Feature"] });
    expect(mockedOutputJson).toHaveBeenCalledWith({
      name: "task-categories",
      description:
        "A JSON array of the best matching categories for the task from the allowed options.",
    });
    expect(mockedGenerateText).toHaveBeenCalledWith({
      model: "openai:gpt-4.1-mini",
      temperature: 0.3,
      system: classifySystemPrompt,
      prompt:
        'Task title: Fix broken login form\nAllowed categories: ["Bug","Feature"]',
      output: {
        name: "task-categories",
        description:
          "A JSON array of the best matching categories for the task from the allowed options.",
      },
    });
  });

  it("throws when the OpenAI API key is missing", async () => {
    configService.get = jest.fn().mockReturnValue(undefined);
    const service = new AiService(configService as ConfigService);

    await expect(service.classify("Fix login", ["Bug"]))
      .rejects.toThrow(InternalServerErrorException);
    await expect(service.classify("Fix login", ["Bug"]))
      .rejects.toThrow("OPENAI_API_KEY is not configured");
    expect(mockedGenerateText).not.toHaveBeenCalled();
  });

  it("throws when no categories are provided", async () => {
    const service = new AiService(configService as ConfigService);

    await expect(service.classify("Fix login", []))
      .rejects.toThrow(InternalServerErrorException);
    await expect(service.classify("Fix login", []))
      .rejects.toThrow("At least one category must be provided");
    expect(mockedGenerateText).not.toHaveBeenCalled();
  });

  it("throws when the AI response is not an array", async () => {
    mockedGenerateText.mockResolvedValue({
      output: "Bug",
    } as unknown as Awaited<ReturnType<typeof generateText>>);

    const service = new AiService(configService as ConfigService);

    await expect(service.classify("Fix login", ["Bug"]))
      .rejects.toThrow(InternalServerErrorException);
    await expect(service.classify("Fix login", ["Bug"]))
      .rejects.toThrow("Invalid response format from AI");
  });
});