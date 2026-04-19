import { Types } from "mongoose";
import { NotFoundException } from "@nestjs/common";
import { TasksService } from "./tasks.service";

describe("TasksService", () => {
  let service: TasksService;
  let mockTaskModel: any;
  let mockTaskEntryModel: any;
  let mockUserModel: any;
  let mockProjectModel: any;

  beforeEach(() => {
    mockTaskModel = jest.fn().mockImplementation(function (data: any) {
      this.data = data;
      this.save = jest
        .fn()
        .mockResolvedValue({ _id: new Types.ObjectId(), ...data });
    });

    mockTaskEntryModel = {
      create: jest.fn().mockResolvedValue({}),
      findOne: jest.fn(),
      insertMany: jest.fn(),
      deleteMany: jest.fn(),
    };

    mockUserModel = {
      findById: jest.fn(),
      updateOne: jest.fn().mockResolvedValue({}),
    };

    mockProjectModel = {
      findOne: jest.fn(),
    };

    service = new TasksService(
      mockTaskModel as any,
      mockTaskEntryModel as any,
      mockUserModel as any,
      mockProjectModel as any,
    );
  });

  it("getCurrentTaskEntry throws NotFoundException when user not found", async () => {
    mockUserModel.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });

    await expect(
      service.getCurrentTaskEntry(new Types.ObjectId()),
    ).rejects.toThrow(NotFoundException);
  });

  it("saveTask creates a task and seeds initial entry", async () => {
    const userId = new Types.ObjectId();
    const payload = { title: "Test task", timeSeconds: 30 } as any;

    mockTaskEntryModel.create.mockResolvedValue({});

    const created = await service.saveTask(userId, payload);

    expect(created).toBeDefined();
    expect(created._id).toBeDefined();
    expect(mockTaskEntryModel.create).toHaveBeenCalled();
  });

  it("createTaskAndStartEntry creates task, creates entry and updates user currentTaskEntryId", async () => {
    const userId = new Types.ObjectId();
    const payload = { title: "Run task" } as any;

    const entryId = new Types.ObjectId();
    mockTaskEntryModel.create.mockResolvedValue({ _id: entryId });

    const createdTask = await service.createTaskAndStartEntry(userId, payload);

    expect(createdTask).toBeDefined();
    expect(createdTask._id).toBeDefined();
    expect(mockUserModel.updateOne).toHaveBeenCalledWith(
      { _id: userId },
      { $set: { currentTaskEntryId: expect.anything() } },
    );
  });

  it("getCurrentTaskEntry returns null when user has no currentTaskEntryId", async () => {
    mockUserModel.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ currentTaskEntryId: undefined }),
    });

    const res = await service.getCurrentTaskEntry(new Types.ObjectId());
    expect(res).toBeNull();
  });

  it("startTaskEntry throws when there is already an active entry for the task", async () => {
    const userId = new Types.ObjectId();
    const taskId = new Types.ObjectId();

    mockTaskEntryModel.findOne.mockResolvedValue({});

    await expect(service.startTaskEntry(userId, taskId)).rejects.toThrow(Error);
  });

  it("endTaskEntry saves entry, unsets user's current entry and calls classifyTask", async () => {
    const userId = new Types.ObjectId();
    const taskId = new Types.ObjectId();

    const startDate = new Date(Date.now() - 5000);
    const activeEntry: any = {
      _id: new Types.ObjectId(),
      startDateTime: startDate,
      save: jest.fn().mockImplementation(function () {
        return Promise.resolve(this);
      }),
    };

    mockTaskEntryModel.findOne.mockResolvedValue(activeEntry);
    mockUserModel.updateOne.mockResolvedValue({});

    // spy classifyTask
    const classifySpy = jest
      .spyOn(service as any, "classifyTask")
      .mockResolvedValue(undefined);

    const saved = await service.endTaskEntry(userId, taskId);

    expect(activeEntry.save).toHaveBeenCalled();
    expect(mockUserModel.updateOne).toHaveBeenCalledWith(
      { _id: userId },
      { $unset: { currentTaskEntryId: "" } },
    );
    expect(classifySpy).toHaveBeenCalledWith(taskId);
    expect(saved).toBeDefined();

    classifySpy.mockRestore();
  });

  it("updateTask appends time entry when timeSeconds provided", async () => {
    const taskId = new Types.ObjectId();
    const taskUserId = new Types.ObjectId();

    mockTaskModel.findById = jest.fn().mockResolvedValue({ userId: taskUserId });
    mockTaskModel.updateOne = jest.fn().mockResolvedValue({ matchedCount: 1, modifiedCount: 1 });

    const payload: any = { timeSeconds: 10, title: "x" };

    await service.updateTask(taskId, payload);

    expect(mockTaskEntryModel.create).toHaveBeenCalledWith({
      taskId,
      userId: taskUserId,
      timeSeconds: payload.timeSeconds,
      startDateTime: expect.any(Date),
      endDateTime: expect.any(Date),
    });
  });

  it("listTasks applies defaults for invalid pagination and excludes active task", async () => {
    const userId = new Types.ObjectId();

    // Collection names used in aggregation
    mockTaskEntryModel.collection = { name: "taskEntries" };
    mockProjectModel.collection = { name: "projects" };

    // active entry exists -> should exclude that task id
    mockTaskEntryModel.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue({ taskId: new Types.ObjectId() }) });

    mockTaskModel.countDocuments = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(2) });
    mockTaskModel.aggregate = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });

    const res = await service.listTasks(userId, { offset: -5, limit: 0 });

    expect(res.offset).toBe(0);
    expect(res.limit).toBe(20);
    expect(res.total).toBe(2);
  });

  it("bulkCreateTasks throws when referenced project not found", async () => {
    const userId = new Types.ObjectId();
    const payloads = [{ title: "T", projectId: new Types.ObjectId().toString(), timeSeconds: 10 }];

    mockProjectModel.find = jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }) });

    await expect(service.bulkCreateTasks(userId, payloads as any)).rejects.toThrow(NotFoundException);
  });

  it("listTaskEntries maps projectId for both ObjectId and populated Project", async () => {
    const userId = new Types.ObjectId();

    const entry1 = {
      _id: new Types.ObjectId(),
      userId,
      timeSeconds: 5,
      startDateTime: new Date(),
      endDateTime: null,
      taskId: { _id: new Types.ObjectId(), title: "t", projectId: new Types.ObjectId() },
    };

    const entry2 = {
      _id: new Types.ObjectId(),
      userId,
      timeSeconds: 10,
      startDateTime: new Date(),
      endDateTime: null,
      taskId: { _id: new Types.ObjectId(), title: "t2", projectId: { _id: new Types.ObjectId(), title: "P", icon: "i", color: "c" } },
    };

    mockTaskEntryModel.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue([entry1, entry2]),
        }),
      }),
    });

    const res = await service.listTaskEntries(userId);

    expect(res.length).toBe(2);
    expect(res[0].projectId).toBe(entry1.taskId.projectId.toString());
    expect(res[1].projectTitle).toBe("P");
  });

  it("updateTask throws when task not found or update fails", async () => {
    const taskId = new Types.ObjectId();

    // not found
    mockTaskModel.findById = jest.fn().mockResolvedValue(null);
    await expect(service.updateTask(taskId, { title: "x" } as any)).rejects.toThrow(NotFoundException);

    // matchedCount === 0
    mockTaskModel.findById = jest.fn().mockResolvedValue({ userId: new Types.ObjectId() });
    mockTaskModel.updateOne = jest.fn().mockResolvedValue({ matchedCount: 0, modifiedCount: 0 });
    await expect(service.updateTask(taskId, { title: "x" } as any)).rejects.toThrow(NotFoundException);

    // modifiedCount === 0
    mockTaskModel.updateOne = jest.fn().mockResolvedValue({ matchedCount: 1, modifiedCount: 0 });
    await expect(service.updateTask(taskId, { title: "x" } as any)).rejects.toThrow(Error);
  });
});
