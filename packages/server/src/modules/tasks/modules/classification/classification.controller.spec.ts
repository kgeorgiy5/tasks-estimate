import { Types } from "mongoose";
import { ClassificationController } from "./classification.controller";

describe("ClassificationController", () => {
  let controller: ClassificationController;
  let mockService: {
    classifyTask: jest.Mock;
  };

  beforeEach(() => {
    mockService = {
      classifyTask: jest.fn().mockResolvedValue({ categories: ["Bug"] }),
    };

    controller = new ClassificationController(mockService as never);
  });

  it("forwards parsed user and task ids to the classification service", async () => {
    const userId = new Types.ObjectId();
    const taskId = new Types.ObjectId();
    const req = { user: { sub: userId.toString() } };

    await controller.classifyTask(req as never, taskId.toString());

    expect(mockService.classifyTask).toHaveBeenCalled();
    const args = mockService.classifyTask.mock.calls[0];
    expect(args[0].toString()).toBe(userId.toString());
    expect(args[1].toString()).toBe(taskId.toString());
  });
});