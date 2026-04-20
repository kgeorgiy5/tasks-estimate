import { Types } from "mongoose";
import { TasksController } from "./tasks.controller";

describe("TasksController", () => {
  let controller: TasksController;
  let mockService: any;

  beforeEach(() => {
    mockService = {
      listTasks: jest
        .fn()
        .mockResolvedValue({ items: [], total: 0, offset: 0, limit: 20 }),
      createTaskAndStartEntry: jest.fn().mockResolvedValue({}),
      bulkCreateTasks: jest.fn().mockResolvedValue([]),
      updateTask: jest.fn().mockResolvedValue(undefined),
      deleteTask: jest.fn().mockResolvedValue(undefined),
      startTaskEntry: jest.fn().mockResolvedValue({}),
      endTaskEntry: jest.fn().mockResolvedValue({}),
      listTaskEntries: jest.fn().mockResolvedValue([]),
      getCurrentTaskEntry: jest.fn().mockResolvedValue(null),
    };

    controller = new TasksController(mockService as any);
  });

  it("listTasks forwards pagination and user id", async () => {
    const userId = new Types.ObjectId();
    const req = { user: { sub: userId.toString() } } as any;
    const pagination = { offset: 5, limit: 10 } as any;

    await controller.listTasks(req, pagination);

    expect(mockService.listTasks).toHaveBeenCalled();
    const calledUserId = mockService.listTasks.mock.calls[0][0];
    expect(calledUserId.toString()).toBe(userId.toString());
    expect(mockService.listTasks.mock.calls[0][1]).toBe(pagination);
  });

  it("createTask calls service.createTaskAndStartEntry", async () => {
    const userId = new Types.ObjectId();
    const req = { user: { sub: userId.toString() } } as any;
    const payload = { title: "t" } as any;

    await controller.createTask(req, payload);

    expect(mockService.createTaskAndStartEntry).toHaveBeenCalled();
    const calledUserId = mockService.createTaskAndStartEntry.mock.calls[0][0];
    expect(calledUserId.toString()).toBe(userId.toString());
  });

  it("startTaskEntry and endTaskEntry forward to service with parsed ids", async () => {
    const userId = new Types.ObjectId();
    const taskId = new Types.ObjectId();
    const req = { user: { sub: userId.toString() } } as any;

    await controller.startTaskEntry(req, taskId.toString());
    expect(mockService.startTaskEntry).toHaveBeenCalled();
    const startArgs = mockService.startTaskEntry.mock.calls[0];
    expect(startArgs[0].toString()).toBe(userId.toString());
    expect(startArgs[1].toString()).toBe(taskId.toString());

    await controller.endTaskEntry(req, taskId.toString());
    expect(mockService.endTaskEntry).toHaveBeenCalled();
    const endArgs = mockService.endTaskEntry.mock.calls[0];
    expect(endArgs[0].toString()).toBe(userId.toString());
    expect(endArgs[1].toString()).toBe(taskId.toString());
  });

  it("listTaskEntries and getCurrentEntry forward to service", async () => {
    const userId = new Types.ObjectId();
    const taskId = new Types.ObjectId();
    const req = { user: { sub: userId.toString() } } as any;

    await controller.listAllTaskEntries(req);
    expect(mockService.listTaskEntries).toHaveBeenCalledWith(userId);

    await controller.listTaskEntries(req, taskId.toString());
    expect(mockService.listTaskEntries).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
    );

    await controller.getCurrentEntry(req);
    expect(mockService.getCurrentTaskEntry).toHaveBeenCalled();
  });
});
