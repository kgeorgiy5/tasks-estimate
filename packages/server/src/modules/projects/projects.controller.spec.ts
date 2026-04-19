import { Types } from "mongoose";
import { ProjectsController } from "./projects.controller";

describe("ProjectsController", () => {
  let controller: ProjectsController;
  let mockService: any;

  beforeEach(() => {
    mockService = {
      listProjects: jest.fn().mockResolvedValue([]),
      createProject: jest.fn().mockResolvedValue({}),
      editProject: jest.fn().mockResolvedValue({}),
      deleteProject: jest.fn().mockResolvedValue(undefined),
    };

    controller = new ProjectsController(mockService as any);
  });

  it("listProjects forwards user id", async () => {
    const userId = new Types.ObjectId();
    const req = { user: { sub: userId.toString() } } as any;

    await controller.listProjects(req);

    expect(mockService.listProjects).toHaveBeenCalled();
    const calledUserId = mockService.listProjects.mock.calls[0][0];
    expect(calledUserId.toString()).toBe(userId.toString());
  });

  it("createProject forwards payload and user id", async () => {
    const userId = new Types.ObjectId();
    const req = { user: { sub: userId.toString() } } as any;
    const payload = { title: "P" } as any;

    await controller.createProject(req, payload);

    expect(mockService.createProject).toHaveBeenCalled();
    const calledUserId = mockService.createProject.mock.calls[0][0];
    expect(calledUserId.toString()).toBe(userId.toString());
  });

  it("updateProject parses ids and calls service.editProject", async () => {
    const userId = new Types.ObjectId();
    const projectId = new Types.ObjectId();
    const req = { user: { sub: userId.toString() } } as any;
    const payload = { title: "X" } as any;

    await controller.updateProject(req, projectId.toString(), payload);

    expect(mockService.editProject).toHaveBeenCalled();
    const args = mockService.editProject.mock.calls[0];
    expect(args[0].toString()).toBe(projectId.toString());
    expect(args[1].toString()).toBe(userId.toString());
  });

  it("deleteProject parses cascade query and forwards to service", async () => {
    const userId = new Types.ObjectId();
    const projectId = new Types.ObjectId();
    const req = { user: { sub: userId.toString() } } as any;

    await controller.deleteProject(req, projectId.toString(), "true");
    expect(mockService.deleteProject).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      true,
    );

    await controller.deleteProject(req, projectId.toString(), "0");
    expect(mockService.deleteProject).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      false,
    );
  });
});
