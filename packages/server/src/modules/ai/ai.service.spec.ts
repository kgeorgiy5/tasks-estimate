jest.mock("ai", () => ({
  generateText: jest.fn(),
  Output: {
    json: jest.fn((config: unknown) => config),
  },
}));

jest.mock("@ai-sdk/openai", () => ({
  createOpenAI: jest.fn(),
}));

import { InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { AiService } from "./ai.service";
import { classifySystemPrompt } from "./prompts/classify.prompt";

describe("AiService", () => {
  const mockedGenerateText = jest.mocked(generateText);
  const mockedOutputJson = jest.mocked(Output.json);
  const mockedCreateOpenAI = jest.mocked(createOpenAI);
  let configService: Pick<ConfigService, "get">;
  let mockedOpenAIModelFactory: jest.Mock;
  const mockedOpenAIModel = { provider: "openai", id: "gpt-4o-mini" };

  beforeEach(() => {
    jest.clearAllMocks();
    configService = {
      get: jest.fn().mockReturnValue("test-api-key"),
    };
    mockedOpenAIModelFactory = jest.fn().mockReturnValue(mockedOpenAIModel);
    mockedCreateOpenAI.mockReturnValue(mockedOpenAIModelFactory as never);
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
      "gpt-4.1-mini",
      0.3,
    );

    expect(result).toEqual({ categories: ["Bug", "Feature"] });
    expect(mockedOutputJson).toHaveBeenCalledWith({
      name: "task-categories",
      description:
        "A JSON array of the best matching categories for the task from the allowed options.",
    });
    expect(mockedCreateOpenAI).toHaveBeenCalledWith({ apiKey: "test-api-key" });
    expect(mockedOpenAIModelFactory).toHaveBeenCalledWith("gpt-4.1-mini");
    expect(mockedGenerateText).toHaveBeenCalledWith({
      model: mockedOpenAIModel,
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

  it("accepts object-wrapped categories in AI response", async () => {
    mockedGenerateText.mockResolvedValue({
      output: {
        categories: ["Bug", "Ignored", "Feature"],
      },
    } as unknown as Awaited<ReturnType<typeof generateText>>);

    const service = new AiService(configService as ConfigService);

    const result = await service.classify("Fix broken login form", [
      "Bug",
      "Feature",
    ]);

    expect(result).toEqual({ categories: ["Bug", "Feature"] });
  });

  it("normalizes AI category values and deduplicates against allowed categories", async () => {
    mockedGenerateText.mockResolvedValue({
      output: {
        categories: [" bug ", "FEATURE", "feature", "Unknown"],
      },
    } as unknown as Awaited<ReturnType<typeof generateText>>);

    const service = new AiService(configService as ConfigService);

    const result = await service.classify("Fix broken login form", [
      "Bug",
      "Feature",
    ]);

    expect(result).toEqual({ categories: ["Bug", "Feature"] });
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