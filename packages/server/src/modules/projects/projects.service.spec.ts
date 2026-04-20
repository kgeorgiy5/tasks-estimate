import { Types } from "mongoose";
import { NotFoundException } from "@nestjs/common";
import { ProjectsService } from "./projects.service";

describe("ProjectsService", () => {
  let service: ProjectsService;
  let mockProjectModel: any;
  let mockWorkflowModel: any;
  let mockTaskModel: any;
  let mockTaskEntryModel: any;

  beforeEach(() => {
    mockProjectModel = {
      create: jest.fn(),
      findOneAndUpdate: jest.fn(),
      deleteOne: jest.fn(),
      find: jest.fn(),
    };

    mockWorkflowModel = {
      updateMany: jest.fn(),
    };

    mockTaskModel = {
      find: jest.fn(),
      deleteMany: jest.fn(),
      updateMany: jest.fn(),
    };

    mockTaskEntryModel = {
      deleteMany: jest.fn(),
    };

    service = new ProjectsService(
      mockProjectModel as any,
      mockWorkflowModel as any,
      mockTaskModel as any,
      mockTaskEntryModel as any,
    );
  });

  it("createProject calls model.create and returns parsed result", async () => {
    const userId = new Types.ObjectId();
    const payload = { title: "P" } as any;

    const createdObj = {
      _id: new Types.ObjectId(),
      title: "P",
      userId: userId.toString(),
    };
    mockProjectModel.create.mockResolvedValue({ toObject: () => createdObj });

    const res = await service.createProject(userId, payload);

    expect(mockProjectModel.create).toHaveBeenCalledWith({
      userId,
      ...payload,
    });
    expect(res).toBeDefined();
  });

  it("editProject throws NotFoundException when update returns null", async () => {
    mockProjectModel.findOneAndUpdate.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });

    await expect(
      service.editProject(
        new Types.ObjectId(),
        new Types.ObjectId(),
        {} as any,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it("deleteProject throws NotFoundException when nothing deleted", async () => {
    mockProjectModel.deleteOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ deletedCount: 0 }),
    });

    await expect(
      service.deleteProject(new Types.ObjectId(), new Types.ObjectId(), false),
    ).rejects.toThrow(NotFoundException);
  });

  it("deleteProject with cascade removes related task entries and tasks", async () => {
    mockProjectModel.deleteOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    });

    mockWorkflowModel.updateMany.mockReturnValue({
      exec: jest.fn().mockResolvedValue({}),
    });

    mockTaskModel.find.mockReturnValue({
      select: jest
        .fn()
        .mockReturnValue({
          lean: jest.fn().mockResolvedValue([{ _id: new Types.ObjectId() }]),
        }),
    });

    mockTaskEntryModel.deleteMany.mockReturnValue({
      exec: jest.fn().mockResolvedValue({}),
    });
    mockTaskModel.deleteMany.mockReturnValue({
      exec: jest.fn().mockResolvedValue({}),
    });

    await service.deleteProject(
      new Types.ObjectId(),
      new Types.ObjectId(),
      true,
    );

    expect(mockWorkflowModel.updateMany).toHaveBeenCalled();
    expect(mockTaskEntryModel.deleteMany).toHaveBeenCalled();
    expect(mockTaskModel.deleteMany).toHaveBeenCalled();
  });

  it("deleteProject without cascade unsets projectId on tasks", async () => {
    mockProjectModel.deleteOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    });
    mockWorkflowModel.updateMany.mockReturnValue({
      exec: jest.fn().mockResolvedValue({}),
    });
    mockTaskModel.updateMany.mockReturnValue({
      exec: jest.fn().mockResolvedValue({}),
    });

    await service.deleteProject(
      new Types.ObjectId(),
      new Types.ObjectId(),
      false,
    );

    expect(mockTaskModel.updateMany).toHaveBeenCalled();
    expect(mockWorkflowModel.updateMany).toHaveBeenCalled();
  });

  it("listProjects returns parsed list", async () => {
    const projects = [
      {
        _id: new Types.ObjectId(),
        title: "A",
        userId: new Types.ObjectId().toString(),
      },
    ];
    mockProjectModel.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue(projects),
    });

    const res = await service.listProjects(new Types.ObjectId());

    expect(mockProjectModel.find).toHaveBeenCalled();
    expect(res).toBeDefined();
  });
});
