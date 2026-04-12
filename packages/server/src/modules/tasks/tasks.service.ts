import { Injectable, NotFoundException } from "@nestjs/common";
import {
  Task,
  TaskEntry,
  TASK_ENTRY_MODEL_TOKEN,
  TASK_MODEL_TOKEN,
} from "./models";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { ErrorIds, ManageTaskDto, CreateTaskDto } from "@tasks-estimate/shared";
import { User, USER_MODEL_TOKEN } from "../users/models";

@Injectable()
export class TasksService {
  private readonly DEFAULT_OFFSET = 0;
  private readonly DEFAULT_LIMIT = 20;

  constructor(
    @InjectModel(TASK_MODEL_TOKEN) private readonly taskModel: Model<Task>,
    @InjectModel(TASK_ENTRY_MODEL_TOKEN)
    private readonly taskEntryModel: Model<TaskEntry>,
    @InjectModel(USER_MODEL_TOKEN)
    private readonly userModel: Model<User>,
  ) {}

  /**
   * Returns user tasks with aggregated tracked time from task entries.
   */
  public async listTasks(
    userId: Types.ObjectId,
    options?: {
      offset?: number;
      limit?: number;
    },
  ) {
    const offset = options?.offset ?? this.DEFAULT_OFFSET;
    const limit = options?.limit ?? this.DEFAULT_LIMIT;

    const [tasks, total] = await Promise.all([
      this.taskModel.find({ userId }).skip(offset).limit(limit).exec(),
      this.taskModel.countDocuments({ userId }).exec(),
    ]);

    const enrichedTasks = await Promise.all(
      tasks.map(async (task) => {
        const timeSeconds = await this.countTaskEntriesTimeSeconds(
          task._id,
          userId,
        );
        return {
          ...task.toObject(),
          timeSeconds,
        };
      }),
    );

    return {
      items: enrichedTasks,
      total,
      offset,
      limit,
    };
  }

  /**
   * Returns the user's current running task entry (or null if none).
   */
  public async getCurrentTaskEntry(userId: Types.ObjectId) {
    const user = await this.userModel.findById(userId).lean();

    if (!user) {
      throw new NotFoundException(ErrorIds.USER_NOT_FOUND);
    }

    if (!user.currentTaskEntryId) return null;

    // Populate the related task so the client can display task metadata
    return await this.taskEntryModel
      .findById(user.currentTaskEntryId)
      .populate<{ taskId: any }>("taskId");
  }

  /**
   * Creates tasks and seeds initial task entries with assigned time.
   */
  public async bulkCreateTasks(
    userId: Types.ObjectId,
    taskPayloads: ManageTaskDto[],
  ) {
    const tasks = taskPayloads.map(
      ({ timeSeconds: _timeSeconds, ...taskPayload }) => ({
        userId,
        ...taskPayload,
      }),
    );

    const createdTasks = await this.taskModel.insertMany(tasks);

    const now = new Date();
    const taskEntries = createdTasks.map((task, taskIndex) => ({
      taskId: task._id,
      userId,
      timeSeconds: taskPayloads[taskIndex]?.timeSeconds ?? 0,
      startDateTime: now,
      endDateTime: now,
    }));

    await this.taskEntryModel.insertMany(taskEntries);

    return createdTasks;
  }

  /**
   * Creates a task and seeds its initial task entry with assigned time.
   */
  public async saveTask(userId: Types.ObjectId, taskPayload: ManageTaskDto) {
    const { timeSeconds, ...taskData } = taskPayload;

    const task = new this.taskModel({
      userId,
      ...taskData,
    });

    const createdTask = await task.save();
    const now = new Date();

    await this.taskEntryModel.create({
      taskId: createdTask._id,
      userId,
      timeSeconds: timeSeconds ?? 0,
      startDateTime: now,
      endDateTime: now,
    });

    return createdTask;
  }

  /**
   * Creates a task and starts a running task entry (no endDateTime).
   */
  public async createTaskAndStartEntry(
    userId: Types.ObjectId,
    taskPayload: CreateTaskDto,
  ) {
    const { classIds, ...taskData } = taskPayload;

    const task = new this.taskModel({
      userId,
      ...taskData,
      classIds,
    });

    const createdTask = await task.save();
    const now = new Date();

    const createdEntry = await this.taskEntryModel.create({
      taskId: createdTask._id,
      userId,
      timeSeconds: 0,
      startDateTime: now,
    });

    await this.userModel.updateOne(
      { _id: userId },
      { $set: { currentTaskEntryId: createdEntry._id } },
    );

    return createdTask;
  }

  /**
   * Updates task metadata and can append an assigned-time task entry.
   */
  public async updateTask(
    taskId: Types.ObjectId,
    taskPayload: ManageTaskDto,
  ): Promise<void> {
    const { timeSeconds, ...taskData } = taskPayload;
    const task = await this.taskModel.findById(taskId);

    if (!task) {
      throw new NotFoundException(ErrorIds.RESOURCE_NOT_FOUND);
    }

    const updateResult = await this.taskModel.updateOne(
      {
        _id: taskId,
      },
      {
        ...taskData,
      },
    );

    if (updateResult.matchedCount === 0) {
      throw new NotFoundException(ErrorIds.RESOURCE_NOT_FOUND);
    }

    if (updateResult.modifiedCount === 0) {
      throw new Error(ErrorIds.FAILED_TO_UPDATE_RESOURCE);
    }

    if (timeSeconds !== undefined) {
      const now = new Date();

      await this.taskEntryModel.create({
        taskId,
        userId: task.userId,
        timeSeconds,
        startDateTime: now,
        endDateTime: now,
      });
    }
  }

  /**
   * Starts a new running entry for a task.
   */
  public async startTaskEntry(userId: Types.ObjectId, taskId: Types.ObjectId) {
    await this.ensureTaskExists(taskId, userId);

    const activeTaskEntry = await this.taskEntryModel.findOne({
      taskId,
      userId,
      endDateTime: { $exists: false },
    });

    if (activeTaskEntry) {
      throw new Error(ErrorIds.FAILED_TO_UPDATE_RESOURCE);
    }

    const createdEntry = await this.taskEntryModel.create({
      taskId,
      userId,
      timeSeconds: 0,
      startDateTime: new Date(),
    });

    await this.userModel.updateOne(
      { _id: userId },
      { $set: { currentTaskEntryId: createdEntry._id } },
    );

    return createdEntry;
  }

  /**
   * Ends the active running entry for a task and triggers classification.
   */
  public async endTaskEntry(userId: Types.ObjectId, taskId: Types.ObjectId) {
    const activeTaskEntry = await this.taskEntryModel.findOne({
      taskId,
      userId,
      endDateTime: { $exists: false },
    });

    if (!activeTaskEntry) {
      throw new NotFoundException(ErrorIds.RESOURCE_NOT_FOUND);
    }

    const endDateTime = new Date();
    const durationSeconds = Math.floor(
      (endDateTime.getTime() - activeTaskEntry.startDateTime.getTime()) / 1000,
    );

    activeTaskEntry.endDateTime = endDateTime;
    activeTaskEntry.timeSeconds = Math.max(durationSeconds, 0);

    const savedTaskEntry = await activeTaskEntry.save();

    await this.userModel.updateOne(
      { _id: userId },
      { $unset: { currentTaskEntryId: "" } },
    );

    await this.classifyTask(taskId);

    return savedTaskEntry;
  }

  /**
   * Deletes a task and its related task entries.
   */
  public async deleteTask(taskId: Types.ObjectId): Promise<void> {
    const deletionResult = await this.taskModel.deleteOne({ _id: taskId });

    if (deletionResult.deletedCount === 0) {
      throw new Error(ErrorIds.FAILED_TO_DELETE_RESOURCE);
    }

    await this.taskEntryModel.deleteMany({ taskId });
  }

  /**
   * Aggregates time across completed task entries for a specific task.
   */
  public async countTaskEntriesTimeSeconds(
    taskId: Types.ObjectId,
    userId?: Types.ObjectId,
  ) {
    const matchQuery: {
      taskId: Types.ObjectId;
      endDateTime: { $exists: boolean };
      userId?: Types.ObjectId;
    } = {
      taskId,
      endDateTime: { $exists: true },
    };

    if (userId) {
      matchQuery.userId = userId;
    }

    const aggregationResult = await this.taskEntryModel.aggregate<{
      _id: Types.ObjectId;
      totalTimeSeconds: number;
    }>([
      {
        $match: matchQuery,
      },
      {
        $group: {
          _id: "$taskId",
          totalTimeSeconds: { $sum: "$timeSeconds" },
        },
      },
    ]);

    return aggregationResult[0]?.totalTimeSeconds ?? 0;
  }

  /**
   * Triggers task classification workflow.
   */
  private async classifyTask(taskId: Types.ObjectId): Promise<void> {
    const task = await this.taskModel.findById(taskId);

    if (!task) {
      throw new NotFoundException(ErrorIds.RESOURCE_NOT_FOUND);
    }

    if (!task.classIds?.length) {
      return;
    }
  }

  /**
   * Ensures task exists and belongs to the provided user.
   */
  private async ensureTaskExists(
    taskId: Types.ObjectId,
    userId: Types.ObjectId,
  ) {
    const task = await this.taskModel.findOne({
      _id: taskId,
      userId,
    });

    if (!task) {
      throw new NotFoundException(ErrorIds.RESOURCE_NOT_FOUND);
    }
  }
}
