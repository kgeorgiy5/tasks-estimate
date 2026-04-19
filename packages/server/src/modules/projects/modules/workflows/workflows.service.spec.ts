import { Types } from "mongoose";
import { NotFoundException } from "@nestjs/common";
import { WorkflowsService } from "./workflows.service";

describe("WorkflowsService", () => {
  let service: WorkflowsService;
  let mockWorkflowModel: any;
  let mockProjectModel: any;
  let mockWorkflowMarketplaceModel: any;

  beforeEach(() => {
    mockWorkflowModel = {
      find: jest.fn(),
      aggregate: jest.fn(),
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      create: jest.fn(),
      deleteOne: jest.fn(),
      distinct: jest.fn(),
    };

    mockProjectModel = {
      exists: jest.fn(),
      findOneAndUpdate: jest.fn(),
      collection: { name: "projects" },
    };

    mockWorkflowMarketplaceModel = {
      find: jest.fn(),
      insertMany: jest.fn(),
    };

    service = new WorkflowsService(
      mockWorkflowModel as any,
      mockProjectModel as any,
      mockWorkflowMarketplaceModel as any,
    );
  });

  it("listMarketplaceWorkflows returns parsed workflows", async () => {
    const mw = { _id: new Types.ObjectId(), domain: "d", title: "t", description: "desc", categories: ["c"], userId: new Types.ObjectId().toString() };
    mockWorkflowMarketplaceModel.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([mw]) });

    const res = await service.listMarketplaceWorkflows("d");

    expect(mockWorkflowMarketplaceModel.find).toHaveBeenCalled();
    expect(res).toBeDefined();
  });

  it("listMarketplaceDomains returns sorted string array", async () => {
    mockWorkflowMarketplaceModel.distinct = undefined as any; // not used here
    mockWorkflowMarketplaceModel.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
    mockWorkflowMarketplaceModel.find.mockClear();
    // simulate distinct via workflowModel on service instantiation path
    mockWorkflowMarketplaceModel.distinct = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(["z","a"]) });

    // call through the service method that uses the marketplace model's distinct
    (service as any).workflowMarketplaceModel = mockWorkflowMarketplaceModel;
    const domains = await service.listMarketplaceDomains();

    expect(Array.isArray(domains)).toBe(true);
    expect(domains).toEqual(["a","z"]);
  });

  it("listUserWorkflows returns parsed list", async () => {
    const wf = {
      _id: new Types.ObjectId(),
      userId: new Types.ObjectId().toString(),
      projectTitle: "P",
      domain: "d",
      title: "t",
      description: "desc",
      categories: ["c"],
    };
    mockWorkflowModel.aggregate.mockReturnValue({ exec: jest.fn().mockResolvedValue([wf]) });

    const res = await service.listUserWorkflows(new Types.ObjectId());

    expect(mockWorkflowModel.aggregate).toHaveBeenCalled();
    expect(res).toBeDefined();
  });

  it("applyWorkflowToProject assigns existing workflow when source has no projectId", async () => {
    const userId = new Types.ObjectId();
    const workflowId = new Types.ObjectId();
    const targetProjectId = new Types.ObjectId();

    // source workflow without projectId
    mockWorkflowModel.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: workflowId, projectId: undefined, domain: "d", title: "t", description: "desc", categories: ["c"], userId: userId.toString() }) });

    mockProjectModel.exists.mockResolvedValue(true);

    mockWorkflowModel.findOneAndUpdate.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: workflowId, projectId: targetProjectId, domain: "d", title: "t", description: "desc", categories: ["c"], userId: userId.toString() }) });

    mockProjectModel.findOneAndUpdate.mockReturnValue({ lean: jest.fn().mockResolvedValue({}) });

    const res = await service.applyWorkflowToProject(workflowId, userId, { projectId: targetProjectId.toString() } as any);

    expect(mockWorkflowModel.findOne).toHaveBeenCalled();
    expect(mockWorkflowModel.findOneAndUpdate).toHaveBeenCalled();
    expect(res).toBeDefined();
  });

  it("applyWorkflowToProject duplicates workflow when source has projectId", async () => {
    const userId = new Types.ObjectId();
    const workflowId = new Types.ObjectId();
    const srcProjectId = new Types.ObjectId();
    const targetProjectId = new Types.ObjectId();

    mockWorkflowModel.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: workflowId, projectId: srcProjectId, domain: "d", title: "t", description: "desc", categories: ["c"], userId: userId.toString() }) });

    mockProjectModel.exists.mockResolvedValue(true);

    const createdObj = { _id: new Types.ObjectId(), domain: "d", title: "t", description: "desc", categories: ["c"], userId: userId.toString(), projectId: targetProjectId };
    mockWorkflowModel.create.mockResolvedValue({ toObject: () => createdObj });
    mockProjectModel.findOneAndUpdate.mockReturnValue({ lean: jest.fn().mockResolvedValue({}) });

    const res = await service.applyWorkflowToProject(workflowId, userId, { projectId: targetProjectId.toString() } as any);

    expect(mockWorkflowModel.create).toHaveBeenCalled();
    expect(res).toBeDefined();
  });

  it("createWorkflow creates and assigns when projectId provided", async () => {
    const userId = new Types.ObjectId();
    const projectId = new Types.ObjectId();

    mockProjectModel.exists.mockResolvedValue(true);

    const createdObj = { _id: new Types.ObjectId(), domain: "d", title: "t", description: "desc", categories: ["c"], userId: userId.toString(), projectId };
    mockWorkflowModel.create.mockResolvedValue({ toObject: () => createdObj });
    mockProjectModel.findOneAndUpdate.mockReturnValue({ lean: jest.fn().mockResolvedValue({}) });

    const res = await service.createWorkflow(userId, { projectId: projectId.toString(), domain: "d", title: "t", description: "desc", categories: ["c"] } as any);

    expect(mockWorkflowModel.create).toHaveBeenCalled();
    expect(res).toBeDefined();
  });

  it("editWorkflow throws when not found", async () => {
    mockWorkflowModel.findOneAndUpdate.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

    await expect(
      service.editWorkflow(new Types.ObjectId(), new Types.ObjectId(), { domain: "x", title: "x", description: "x", categories: [] } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it("deleteWorkflow throws when none deleted", async () => {
    mockWorkflowModel.deleteOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 0 }) });

    await expect(
      service.deleteWorkflow(new Types.ObjectId(), new Types.ObjectId()),
    ).rejects.toThrow(NotFoundException);
  });

  it("listWorkflows ensures project exists and returns list", async () => {
    const userId = new Types.ObjectId();
    const projectId = new Types.ObjectId();

    mockProjectModel.exists.mockResolvedValue(true);
    mockWorkflowModel.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([{ _id: new Types.ObjectId(), userId: userId.toString(), projectId: projectId.toString(), domain: "d", title: "t", description: "desc", categories: ["c"] }]) });

    const res = await service.listWorkflows(userId, projectId);

    expect(mockWorkflowModel.find).toHaveBeenCalled();
    expect(res).toBeDefined();
  });

  it("listWorkflowCategories returns sorted list", async () => {
    const userId = new Types.ObjectId();
    const projectId = new Types.ObjectId();

    mockProjectModel.exists.mockResolvedValue(true);
    mockWorkflowModel.distinct.mockReturnValue({ exec: jest.fn().mockResolvedValue(["z","a","b"]) });

    const res = await service.listWorkflowCategories(userId, projectId);

    expect(res).toEqual(["a","b","z"]);
  });
});
