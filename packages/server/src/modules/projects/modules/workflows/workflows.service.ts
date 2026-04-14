import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  ApplyWorkflowDto,
  ErrorIds,
  getWorkflowSchema,
  listMarketplaceWorkflowSchema,
  listUserWorkflowsSchema,
  listWorkflowSchema,
  ManageWorkflowDto,
} from "@tasks-estimate/shared";
import { PROJECT_MODEL_TOKEN, Project } from "../../models";
import {
  WORKFLOW_MARKETPLACE_MODEL,
  WORKFLOW_MODEL_TOKEN,
  MarketplaceWorkflow,
  Workflow,
} from "./models";
import { defaultWorkflows } from "./config";

@Injectable()
export class WorkflowsService {
  constructor(
    @InjectModel(WORKFLOW_MODEL_TOKEN)
    private readonly workflowModel: Model<Workflow>,
    @InjectModel(PROJECT_MODEL_TOKEN)
    private readonly projectModel: Model<Project>,
    @InjectModel(WORKFLOW_MARKETPLACE_MODEL)
    private readonly workflowMarketplaceModel: Model<MarketplaceWorkflow>,
  ) {}

  public async initializeWorkflowMarketplace() {
    const existing = await this.workflowMarketplaceModel.find().lean();

    const toInsert = defaultWorkflows.filter(
      (mw) =>
        !existing.some(
          (ew) =>
            ew.domain === mw.domain &&
            ew.title === mw.title &&
            ew.description === mw.description &&
            ew.categories.length === mw.categories.length &&
            ew.categories.every((cat) => mw.categories.includes(cat)),
        ),
    );

    if (toInsert.length > 0) {
      await this.workflowMarketplaceModel.insertMany(toInsert);
    }
  }

  /**
   * Lists marketplace workflows with optional domain filtering.
   */
  public async listMarketplaceWorkflows(domain?: string) {
    const query = domain ? { domain } : {};
    const workflows = await this.workflowMarketplaceModel.find(query).lean();
    return listMarketplaceWorkflowSchema.parse(workflows);
  }

  /**
   * Returns distinct domains available in the marketplace.
   */
  public async listMarketplaceDomains() {
    const domains = await this.workflowMarketplaceModel
      .distinct("domain")
      .exec();
    if (!Array.isArray(domains)) {
      return [];
    }

    return domains
      .filter((domain): domain is string => typeof domain === "string")
      .sort((left, right) => left.localeCompare(right));
  }

  /**
   * Lists all workflows for the authenticated user with project titles.
   */
  public async listUserWorkflows(userId: Types.ObjectId) {
    const projectCollection = this.projectModel.collection.name;

    const workflows = await this.workflowModel
      .aggregate([
        {
          $match: { userId },
        },
        {
          $lookup: {
            from: projectCollection,
            localField: "projectId",
            foreignField: "_id",
            as: "project",
          },
        },
        {
          $addFields: {
            projectTitle: {
              $arrayElemAt: ["$project.title", 0],
            },
          },
        },
        {
          $project: {
            project: 0,
          },
        },
        {
          $sort: {
            _id: -1,
          },
        },
      ])
      .exec();

    return listUserWorkflowsSchema.parse(workflows);
  }

  /**
   * Copies an existing workflow into another project owned by the same user.
   */
  public async applyWorkflowToProject(
    workflowId: Types.ObjectId,
    userId: Types.ObjectId,
    payload: ApplyWorkflowDto,
  ) {
    const sourceWorkflow = await this.findUserWorkflow(workflowId, userId);
    const targetProjectId = new Types.ObjectId(payload.projectId);

    await this.ensureProjectExists(targetProjectId, userId);

    // If the source workflow is not linked to any project, assign it to the
    // target project instead of creating a duplicate. Otherwise, create a
    // copy of the workflow for the target project.
    if (!sourceWorkflow.projectId) {
      const updated = await this.workflowModel
        .findOneAndUpdate(
          { _id: workflowId, userId },
          { $set: { projectId: targetProjectId } },
          { new: true },
        )
        .lean();

      if (!updated) {
        throw new NotFoundException(ErrorIds.RESOURCE_NOT_FOUND);
      }

      await this.assignProjectWorkflow(targetProjectId, userId, updated._id);

      return getWorkflowSchema.parse(updated);
    }

    const created = await this.workflowModel.create({
      userId,
      projectId: targetProjectId,
      domain: sourceWorkflow.domain,
      title: sourceWorkflow.title,
      description: sourceWorkflow.description,
      categories: sourceWorkflow.categories,
    });

    await this.assignProjectWorkflow(targetProjectId, userId, created._id);

    return getWorkflowSchema.parse(created.toObject());
  }

  /**
   * Creates a workflow scoped to the authenticated user and project.
   */
  public async createWorkflow(
    userId: Types.ObjectId,
    payload: ManageWorkflowDto,
  ) {
    const projectId = new Types.ObjectId(payload.projectId);

    await this.ensureProjectExists(projectId, userId);

    const created = await this.workflowModel.create({
      userId,
      projectId,
      domain: payload.domain,
      title: payload.title,
      description: payload.description,
      categories: payload.categories,
    });

    await this.assignProjectWorkflow(projectId, userId, created._id);

    return getWorkflowSchema.parse(created.toObject());
  }

  /**
   * Updates a workflow owned by the authenticated user.
   */
  public async editWorkflow(
    workflowId: Types.ObjectId,
    userId: Types.ObjectId,
    payload: ManageWorkflowDto,
  ) {
    await this.ensureProjectExists(
      new Types.ObjectId(payload.projectId),
      userId,
    );

    const updated = await this.workflowModel
      .findOneAndUpdate(
        { _id: workflowId, userId },
        {
          $set: {
            projectId: payload.projectId,
            domain: payload.domain,
            title: payload.title,
            description: payload.description,
            categories: payload.categories,
          },
        },
        { new: true },
      )
      .lean();

    if (!updated) {
      throw new NotFoundException(ErrorIds.RESOURCE_NOT_FOUND);
    }

    return getWorkflowSchema.parse(updated);
  }

  /**
   * Deletes a workflow if it belongs to the authenticated user.
   */
  public async deleteWorkflow(
    workflowId: Types.ObjectId,
    userId: Types.ObjectId,
  ) {
    const result = await this.workflowModel
      .deleteOne({ _id: workflowId, userId })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(ErrorIds.RESOURCE_NOT_FOUND);
    }
  }

  /**
   * Lists user workflows filtered by project.
   */
  public async listWorkflows(
    userId: Types.ObjectId,
    projectId: Types.ObjectId,
  ) {
    await this.ensureProjectExists(projectId, userId);

    const workflows = await this.workflowModel
      .find({ userId, projectId })
      .lean();

    return listWorkflowSchema.parse(workflows);
  }

  /**
   * Lists distinct categories used by workflows in the specified project.
   */
  public async listWorkflowCategories(
    userId: Types.ObjectId,
    projectId: Types.ObjectId,
  ) {
    await this.ensureProjectExists(projectId, userId);

    const categories = await this.workflowModel
      .distinct("categories", { userId, projectId })
      .exec();

    if (!Array.isArray(categories)) return [];

    return categories
      .filter((c): c is string => typeof c === "string")
      .sort((a, b) => a.localeCompare(b));
  }

  /**
   * Ensures project exists and is owned by the authenticated user.
   */
  private async ensureProjectExists(
    projectId: Types.ObjectId,
    userId: Types.ObjectId,
  ) {
    const project = await this.projectModel.exists({ _id: projectId, userId });
    if (!project) {
      throw new NotFoundException(ErrorIds.RESOURCE_NOT_FOUND);
    }
  }

  /**
   * Returns workflow by id only if it belongs to the authenticated user.
   */
  private async findUserWorkflow(
    workflowId: Types.ObjectId,
    userId: Types.ObjectId,
  ) {
    const workflow = await this.workflowModel
      .findOne({ _id: workflowId, userId })
      .lean();

    if (!workflow) {
      throw new NotFoundException(ErrorIds.RESOURCE_NOT_FOUND);
    }

    return workflow;
  }

  /**
   * Assigns workflow id to the target project.
   */
  private async assignProjectWorkflow(
    projectId: Types.ObjectId,
    userId: Types.ObjectId,
    workflowId: Types.ObjectId,
  ) {
    const project = await this.projectModel
      .findOneAndUpdate(
        { _id: projectId, userId },
        {
          $set: {
            workflowId,
          },
        },
        { new: true },
      )
      .lean();

    if (!project) {
      throw new NotFoundException(ErrorIds.RESOURCE_NOT_FOUND);
    }
  }
}
