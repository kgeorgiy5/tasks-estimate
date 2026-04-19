import { Types } from "mongoose";
import { WorkflowsController } from "./workflows.controller";

describe("WorkflowsController", () => {
  let controller: WorkflowsController;
  let mockService: any;

  beforeEach(() => {
    mockService = {
      listWorkflows: jest.fn().mockResolvedValue([]),
      listWorkflowCategories: jest.fn().mockResolvedValue([]),
      listMarketplaceWorkflows: jest.fn().mockResolvedValue([]),
      listMarketplaceDomains: jest.fn().mockResolvedValue([]),
      listUserWorkflows: jest.fn().mockResolvedValue([]),
      createWorkflow: jest.fn().mockResolvedValue({}),
      applyWorkflowToProject: jest.fn().mockResolvedValue({}),
      editWorkflow: jest.fn().mockResolvedValue({}),
      deleteWorkflow: jest.fn().mockResolvedValue(undefined),
    };

    controller = new WorkflowsController(mockService as any);
  });

  it("listWorkflows forwards userId and projectId", async () => {
    const userId = new Types.ObjectId();
    const projectId = new Types.ObjectId();
    const req = { user: { sub: userId.toString() } } as any;
    const query = { projectId: projectId.toString() } as any;

    await controller.listWorkflows(req, query);

    expect(mockService.listWorkflows).toHaveBeenCalled();
    const args = mockService.listWorkflows.mock.calls[0];
    expect(args[0].toString()).toBe(userId.toString());
    expect(args[1].toString()).toBe(projectId.toString());
  });

  it("listWorkflowCategoriesByProject forwards ids", async () => {
    const userId = new Types.ObjectId();
    const projectId = new Types.ObjectId();
    const req = { user: { sub: userId.toString() } } as any;

    await controller.listWorkflowCategoriesByProject(req, projectId.toString());

    expect(mockService.listWorkflowCategories).toHaveBeenCalled();
    const args = mockService.listWorkflowCategories.mock.calls[0];
    expect(args[0].toString()).toBe(userId.toString());
    expect(args[1].toString()).toBe(projectId.toString());
  });

  it("listMarketplace and domains call service", async () => {
    await controller.listMarketplace({ domain: "x" } as any);
    expect(mockService.listMarketplaceWorkflows).toHaveBeenCalledWith("x");

    await controller.listMarketplaceDomains();
    expect(mockService.listMarketplaceDomains).toHaveBeenCalled();
  });

  it("listMyWorkflows forwards userId", async () => {
    const userId = new Types.ObjectId();
    const req = { user: { sub: userId.toString() } } as any;

    await controller.listMyWorkflows(req);
    expect(mockService.listUserWorkflows).toHaveBeenCalled();
    expect(mockService.listUserWorkflows.mock.calls[0][0].toString()).toBe(userId.toString());
  });

  it("createWorkflow, apply, update, delete forward to service with parsed ids", async () => {
    const userId = new Types.ObjectId();
    const wfId = new Types.ObjectId();
    const projectId = new Types.ObjectId();
    const req = { user: { sub: userId.toString() } } as any;

    await controller.createWorkflow(req, { domain: "d", title: "t", description: "x", categories: [] } as any);
    expect(mockService.createWorkflow).toHaveBeenCalled();

    await controller.applyWorkflowToAnotherProject(req, wfId.toString(), { projectId: projectId.toString() } as any);
    expect(mockService.applyWorkflowToProject).toHaveBeenCalled();

    await controller.updateWorkflow(req, wfId.toString(), { domain: "d", title: "t", description: "x", categories: [] } as any);
    expect(mockService.editWorkflow).toHaveBeenCalled();

    await controller.deleteWorkflow(req, wfId.toString());
    expect(mockService.deleteWorkflow).toHaveBeenCalled();
  });
});
