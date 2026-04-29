import { Types } from "mongoose";
import { DraftClassificationController } from "./draft-classification.controller";

describe("DraftClassificationController", () => {
  let controller: DraftClassificationController;
  let mockService: {
    classifyDraftTask: jest.Mock;
  };

  beforeEach(() => {
    mockService = {
      classifyDraftTask: jest.fn().mockResolvedValue({ categories: ["Bug"] }),
    };

    controller = new DraftClassificationController(mockService as never);
  });

  it("forwards the user id and payload to the classification service", async () => {
    const userId = new Types.ObjectId();
    const payload = {
      title: "Fix login redirect",
      projectId: new Types.ObjectId().toString(),
    };
    const req = { user: { sub: userId.toString() } };

    await controller.classifyDraftTask(req as never, payload);

    expect(mockService.classifyDraftTask).toHaveBeenCalledWith(
      expect.anything(),
      payload,
    );
    expect(mockService.classifyDraftTask.mock.calls[0][0].toString()).toBe(
      userId.toString(),
    );
  });
});