import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";
import { AiService } from "../../../ai/ai.service";
import { WorkflowsService } from "../../../projects/modules/workflows/workflows.service";
import { ClassificationService } from "./classification.service";

describe("ClassificationService", () => {
  let service: ClassificationService;
  let mockTaskModel: {
    findOne: jest.Mock;
  };
  let mockAiService: Pick<AiService, "classify">;
  let mockWorkflowsService: Pick<WorkflowsService, "listWorkflowCategories">;

  beforeEach(() => {
    mockTaskModel = {
      findOne: jest.fn(),
    };

    mockAiService = {
      classify: jest.fn(),
    };

    mockWorkflowsService = {
      listWorkflowCategories: jest.fn(),
    };

    service = new ClassificationService(
      mockTaskModel as never,
      mockAiService as AiService,
      mockWorkflowsService as WorkflowsService,
    );
  });

  it("classifies a task, saves assigned categories, and returns them", async () => {
    const userId = new Types.ObjectId();
    const taskId = new Types.ObjectId();
    const projectId = new Types.ObjectId();
    const task = {
      _id: taskId,
      title: "Fix login redirect",
      projectId,
      categories: [],
      save: jest.fn().mockResolvedValue(undefined),
    };

    mockTaskModel.findOne.mockResolvedValue(task);
    mockWorkflowsService.listWorkflowCategories = jest
      .fn()
      .mockResolvedValue(["Bug", "Feature"]);
    mockAiService.classify = jest.fn().mockResolvedValue({
      categories: ["Bug"],
    });

    const result = await service.classifyTask(userId, taskId);

    expect(mockTaskModel.findOne).toHaveBeenCalledWith({ _id: taskId, userId });
    expect(mockWorkflowsService.listWorkflowCategories).toHaveBeenCalledWith(
      userId,
      expect.anything(),
    );
    expect(mockAiService.classify).toHaveBeenCalledWith("Fix login redirect", [
      "Bug",
      "Feature",
    ]);
    expect(task.categories).toEqual(["Bug"]);
    expect(task.save).toHaveBeenCalled();
    expect(result).toEqual({ categories: ["Bug"] });
  });

  it("classifies a draft task without persisting it", async () => {
    const userId = new Types.ObjectId();
    const payload = {
      title: "Fix login redirect",
      projectId: new Types.ObjectId().toString(),
    };

    mockWorkflowsService.listWorkflowCategories = jest
      .fn()
      .mockResolvedValue(["Bug", "Feature"]);
    mockAiService.classify = jest.fn().mockResolvedValue({
      categories: ["Feature"],
    });

    const result = await service.classifyDraftTask(userId, payload);

    expect(mockTaskModel.findOne).not.toHaveBeenCalled();
    expect(mockWorkflowsService.listWorkflowCategories).toHaveBeenCalledWith(
      userId,
      expect.anything(),
    );
    expect(mockAiService.classify).toHaveBeenCalledWith("Fix login redirect", [
      "Bug",
      "Feature",
    ]);
    expect(result).toEqual({ categories: ["Feature"] });
  });

  it("throws bad request when the task has no project", async () => {
    const userId = new Types.ObjectId();
    const taskId = new Types.ObjectId();

    mockTaskModel.findOne.mockResolvedValue({
      _id: taskId,
      title: "Inbox task",
      projectId: undefined,
      save: jest.fn(),
    });

    await expect(service.classifyTask(userId, taskId)).rejects.toThrow(
      BadRequestException,
    );
    await expect(service.classifyTask(userId, taskId)).rejects.toThrow(
      "Task has no project assigned",
    );
  });

  it("throws bad request when the project has no workflow categories", async () => {
    const userId = new Types.ObjectId();
    const taskId = new Types.ObjectId();
    const projectId = new Types.ObjectId();

    mockTaskModel.findOne.mockResolvedValue({
      _id: taskId,
      title: "Fix login redirect",
      projectId,
      save: jest.fn(),
    });
    mockWorkflowsService.listWorkflowCategories = jest
      .fn()
      .mockResolvedValue([]);

    await expect(service.classifyTask(userId, taskId)).rejects.toThrow(
      BadRequestException,
    );
    expect(mockAiService.classify).not.toHaveBeenCalled();
  });

  it("throws not found when the task does not belong to the user", async () => {
    await expect(
      service.classifyTask(new Types.ObjectId(), new Types.ObjectId()),
    ).rejects.toThrow(NotFoundException);
  });
});