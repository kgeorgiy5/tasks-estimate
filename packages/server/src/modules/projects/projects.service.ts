import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { PROJECT_MODEL_TOKEN, Project } from "./models";
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
  ) {
    const res = await this.projectModel
      .deleteOne({ _id: projectId, userId })
      .exec();

    if (res.deletedCount === 0) {
      throw new NotFoundException(ErrorIds.RESOURCE_NOT_FOUND);
    }
  }

  public async listProjects(userId: Types.ObjectId) {
    const projects = await this.projectModel.find({ userId }).lean();

    return listProjectSchema.parse(projects);
  }
}
