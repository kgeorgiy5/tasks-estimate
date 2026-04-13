import { Injectable, NotFoundException } from "@nestjs/common";
import {
  Task,
  TaskEntry,
  TASK_ENTRY_MODEL_TOKEN,
  TASK_MODEL_TOKEN,
} from "./models";
import { Project, PROJECT_MODEL_TOKEN } from "../projects/models";
import { PopulatedTask } from "./types/populated-task";
import { TaskInsertItem } from "./types/task-insert-item";
import { Model, PipelineStage, QueryFilter, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import {
  ErrorIds,
  ManageTaskDto,
  CreateTaskDto,
  ListTaskEntryDto,
} from "@tasks-estimate/shared";
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
    @InjectModel(PROJECT_MODEL_TOKEN)
    private readonly projectModel: Model<Project>,
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
    let offset = Number(options?.offset ?? this.DEFAULT_OFFSET);
    if (!Number.isFinite(offset) || offset < 0) offset = this.DEFAULT_OFFSET;
    let limit = Number(options?.limit ?? this.DEFAULT_LIMIT);
    if (!Number.isFinite(limit) || limit <= 0) limit = this.DEFAULT_LIMIT;

    const activeEntry = await this.taskEntryModel
      .findOne({
        userId,
        endDateTime: { $exists: false },
      })
      .select("taskId");

    const taskFilter: QueryFilter<Task> = { userId };
    if (activeEntry?.taskId) {
      taskFilter._id = { $ne: activeEntry.taskId };
    }

    const total = await this.taskModel.countDocuments(taskFilter).exec();

    const entryColl = this.taskEntryModel.collection.name;
    const projectColl = this.projectModel.collection.name;

    const pipeline: PipelineStage[] = [
      { $match: taskFilter },
      {
        $lookup: {
          from: projectColl,
          localField: "projectId",
          foreignField: "_id",
          as: "project",
        },
      },
      {
        $lookup: {
          from: entryColl,
          let: { taskId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$taskId", "$$taskId"] },
                    { $eq: ["$userId", userId] },
                  ],
                },
              },
            },
            { $sort: { startDateTime: -1 } },
            { $limit: 1 },
            { $project: { startDateTime: 1 } },
          ],
          as: "lastEntry",
        },
      },
      {
        $lookup: {
          from: entryColl,
          let: { taskId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$taskId", "$$taskId"] },
                    { $eq: ["$userId", userId] },
                    { $ne: ["$endDateTime", null] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                totalTimeSeconds: { $sum: { $ifNull: ["$timeSeconds", 0] } },
              },
            },
          ],
          as: "timeAgg",
        },
      },
      {
        $lookup: {
          from: entryColl,
          let: { taskId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$taskId", "$$taskId"] },
                    { $eq: ["$userId", userId] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
              },
            },
          ],
          as: "entriesCount",
        },
      },
      {
        $addFields: {
          lastEntryStartDateTime: {
            $arrayElemAt: ["$lastEntry.startDateTime", 0],
          },
          timeSeconds: {
            $ifNull: [{ $arrayElemAt: ["$timeAgg.totalTimeSeconds", 0] }, 0],
          },
          entriesCount: {
            $ifNull: [{ $arrayElemAt: ["$entriesCount.count", 0] }, 0],
          },
          projectId: { $arrayElemAt: ["$project._id", 0] },
          projectTitle: { $arrayElemAt: ["$project.title", 0] },
          projectIcon: { $arrayElemAt: ["$project.icon", 0] },
          projectColor: { $arrayElemAt: ["$project.color", 0] },
        },
      },
      {
        $addFields: {
          _sortKey: {
            $cond: [
              { $ifNull: ["$lastEntryStartDateTime", false] },
              "$lastEntryStartDateTime",
              new Date(0),
            ],
          },
        },
      },
      { $sort: { _sortKey: -1, _id: -1 } },
      { $skip: offset },
      { $limit: limit },
      { $project: { lastEntry: 0, timeAgg: 0, _sortKey: 0, project: 0 } },
    ];

    const enrichedTasks = await this.taskModel.aggregate(pipeline).exec();

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
      .populate<{ taskId: Types.ObjectId }>("taskId");
  }

  /**
   * Lists entries with populated task title.
   */
  public async listTaskEntries(
    userId: Types.ObjectId,
    taskId?: Types.ObjectId,
  ): Promise<ListTaskEntryDto[]> {
    if (taskId) {
      await this.ensureTaskExists(taskId, userId);
    }

    const query: {
      userId: Types.ObjectId;
      taskId?: Types.ObjectId;
    } = { userId };

    if (taskId) {
      query.taskId = taskId;
    }

    const entries = await this.taskEntryModel
      .find(query)
      .sort({ startDateTime: 1, _id: 1 })
      .populate<{ taskId: PopulatedTask }>("taskId", "title projectId")
      .populate({
        path: "taskId",
        populate: { path: "projectId", select: "title icon color" },
      });

    return entries.map((entry) => {
      const project = entry.taskId.projectId as
        | Types.ObjectId
        // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
        | Project
        | undefined;

      let projectId: string | undefined;
      if (project?._id) {
        projectId = project._id.toString();
      } else if (project) {
        projectId = String(project);
      } else {
        projectId = undefined;
      }

      return {
        _id: entry._id.toString(),
        taskId: entry.taskId._id.toString(),
        taskTitle: entry.taskId.title,
        projectId,
        projectTitle: project?._id ? (project as Project).title : undefined,
        projectIcon: project?._id ? (project as Project).icon : undefined,
        projectColor: project?._id ? (project as Project).color : undefined,
        userId: entry.userId.toString(),
        timeSeconds: entry.timeSeconds,
        startDateTime: entry.startDateTime.toISOString(),
        endDateTime: entry.endDateTime ? entry.endDateTime.toISOString() : null,
      };
    });
  }

  /**
   * Creates tasks and seeds initial task entries with assigned time.
   */
  public async bulkCreateTasks(
    userId: Types.ObjectId,
    taskPayloads: ManageTaskDto[],
  ) {
    const tasks: TaskInsertItem[] = taskPayloads.map(
      ({ timeSeconds: _timeSeconds, title, classIds, projectId }) => ({
        userId,
        title,
        classIds,
        projectId,
      }),
    );

    const projectIds = Array.from(
      new Set(
        tasks
          .map((t) => t.projectId)
          .filter(
            (id): id is string | Types.ObjectId =>
              id !== undefined && id !== null,
          )
          .map((id) => id.toString()),
      ),
    );

    if (projectIds.length) {
      const found = await this.projectModel
        .find({ _id: { $in: projectIds }, userId })
        .select("_id")
        .lean();

      if (found.length !== projectIds.length) {
        throw new NotFoundException(ErrorIds.RESOURCE_NOT_FOUND);
      }
    }

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

    if ((taskData as any).projectId) {
      await this.ensureProjectExists(
        new Types.ObjectId((taskData as any).projectId),
        userId,
      );
    }

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

    if ((taskData as any).projectId) {
      await this.ensureProjectExists(
        new Types.ObjectId((taskData as any).projectId),
        userId,
      );
    }

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

  private async ensureProjectExists(
    projectId: Types.ObjectId,
    userId: Types.ObjectId,
  ) {
    const project = await this.projectModel.findOne({
      _id: projectId,
      userId,
    });

    if (!project) {
      throw new NotFoundException(ErrorIds.RESOURCE_NOT_FOUND);
    }
  }
}
