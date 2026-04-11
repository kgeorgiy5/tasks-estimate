import { Injectable, NotFoundException } from "@nestjs/common";
import { Task, TASK_MODEL_TOKEN } from "./models";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { ErrorIds, ManageTaskDto } from "@tasks-estimate/shared";

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(TASK_MODEL_TOKEN) private readonly taskModel: Model<Task>,
  ) {}

  public async listTasks(userId: Types.ObjectId) {
    return await this.taskModel.find({
      userId,
    });
  }

  public async bulkCreateTasks(
    userId: Types.ObjectId,
    taskPayloads: ManageTaskDto[],
  ) {
    const tasks = taskPayloads.map((taskPayload) => ({
      userId,
      ...taskPayload,
    }));

    return await this.taskModel.insertMany(tasks);
  }

  public async saveTask(userId: Types.ObjectId, taskPayload: ManageTaskDto) {
    if (!taskPayload.classIds) {
      // TODO: Implement LLM classification
    }

    const task = new this.taskModel({
      userId,
      ...taskPayload,
    });

    return await task.save();
  }

  public async updateTask(
    taskId: Types.ObjectId,
    taskPayload: ManageTaskDto,
  ): Promise<void> {
    const updateResult = await this.taskModel.updateOne(
      {
        _id: taskId,
      },
      {
        ...taskPayload,
      },
    );

    if (updateResult.matchedCount === 0) {
      throw new NotFoundException(ErrorIds.RESOURCE_NOT_FOUND);
    }

    if (updateResult.modifiedCount === 0) {
      throw new Error(ErrorIds.FAILED_TO_UPDATE_RESOURCE);
    }
  }

  public async deleteTask(taskId: Types.ObjectId): Promise<void> {
    const deletionResult = await this.taskModel.deleteOne({ _id: taskId });

    if (deletionResult.deletedCount === 0) {
      throw new Error(ErrorIds.FAILED_TO_DELETE_RESOURCE);
    }
  }
}
