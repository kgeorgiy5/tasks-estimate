import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { PROJECT_MODEL_TOKEN, Project } from "./models";
import { WORKFLOW_MODEL_TOKEN, Workflow } from "./modules/workflows/models";
import {
  TASK_MODEL_TOKEN,
  Task,
  TASK_ENTRY_MODEL_TOKEN,
  TaskEntry,
} from "../tasks/models";
import {
  ManageProjectDto,
  getProjectSchema,
  listProjectSchema,
  ErrorIds,
} from "@tasks-estimate/shared";

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(PROJECT_MODEL_TOKEN)
    private readonly projectModel: Model<Project>,
    @InjectModel(WORKFLOW_MODEL_TOKEN)
    private readonly workflowModel: Model<Workflow>,
    @InjectModel(TASK_MODEL_TOKEN)
    private readonly taskModel: Model<Task>,
    @InjectModel(TASK_ENTRY_MODEL_TOKEN)
    private readonly taskEntryModel: Model<TaskEntry>,
  ) {}

  public async createProject(
    userId: Types.ObjectId,
    payload: ManageProjectDto,
  ) {
    const created = await this.projectModel.create({ userId, ...payload });

    return getProjectSchema.parse(created.toObject());
  }

  public async editProject(
    projectId: Types.ObjectId,
    userId: Types.ObjectId,
    payload: ManageProjectDto,
  ) {
    const updated = await this.projectModel
      .findOneAndUpdate(
        { _id: projectId, userId },
        { $set: payload },
        { new: true },
      )
      .lean();

    if (!updated) throw new NotFoundException(ErrorIds.RESOURCE_NOT_FOUND);

    return getProjectSchema.parse(updated);
  }

  public async deleteProject(
    projectId: Types.ObjectId,
    userId: Types.ObjectId,
    cascade = false,
  ) {
    const res = await this.projectModel
      .deleteOne({ _id: projectId, userId })
      .exec();

    if (res.deletedCount === 0) {
      throw new NotFoundException(ErrorIds.RESOURCE_NOT_FOUND);
    }

    await this.workflowModel
      .updateMany({ projectId, userId }, { $unset: { projectId: "" } })
      .exec();

    if (cascade) {
      const tasks = await this.taskModel
        .find({ projectId, userId })
        .select("_id")
        .lean();

      const taskIds = tasks.map((t) => t._id);

      if (taskIds.length) {
        await this.taskEntryModel
          .deleteMany({ taskId: { $in: taskIds } })
          .exec();
        await this.taskModel.deleteMany({ _id: { $in: taskIds } }).exec();
      }
    } else {
      await this.taskModel
        .updateMany({ projectId, userId }, { $unset: { projectId: "" } })
        .exec();
    }
  }

  public async listProjects(userId: Types.ObjectId) {
    const projects = await this.projectModel.find({ userId }).lean();

    return listProjectSchema.parse(projects);
  }
}
