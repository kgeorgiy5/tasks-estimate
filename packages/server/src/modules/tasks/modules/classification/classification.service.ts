import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import {
  ClassifyDraftTaskDto,
  ErrorIds,
  TaskClassificationResultDto,
} from "@tasks-estimate/shared";
import { Model, Types } from "mongoose";
import { AiService } from "../../../ai/ai.service";
import { WorkflowsService } from "../../../projects/modules/workflows/workflows.service";
import { Task, TASK_MODEL_TOKEN } from "../../models";

@Injectable()
export class ClassificationService {
  /**
   * Creates a classification service instance.
   * @param taskModel - Task model used to load and persist task categories
   * @param aiService - AI classification adapter
   * @param workflowsService - Workflow category source for project-scoped classification
   */
  public constructor(
    @InjectModel(TASK_MODEL_TOKEN) private readonly taskModel: Model<Task>,
    private readonly aiService: AiService,
    private readonly workflowsService: WorkflowsService,
  ) {}

  /**
   * Classifies a task by title using categories available on the task's project workflows.
   * @param userId - Authenticated user id
   * @param taskId - Task id to classify
   */
  public async classifyTask(
    userId: Types.ObjectId,
    taskId: Types.ObjectId,
  ): Promise<TaskClassificationResultDto> {
    const task = await this.taskModel.findOne({ _id: taskId, userId });

    if (!task) {
      throw new NotFoundException(ErrorIds.RESOURCE_NOT_FOUND);
    }

    if (!task.projectId) {
      throw new BadRequestException("Task has no project assigned");
    }

    const result = await this.classifyTitleByProject(
      userId,
      task.title,
      new Types.ObjectId(task.projectId.toString()),
    );

    task.categories = result.categories;
    await task.save();

    return result;
  }

  /**
   * Classifies a draft task before it is persisted.
   * @param userId - Authenticated user id
   * @param payload - Draft task fields required for classification
   */
  public async classifyDraftTask(
    userId: Types.ObjectId,
    payload: ClassifyDraftTaskDto,
  ): Promise<TaskClassificationResultDto> {
    return await this.classifyTitleByProject(
      userId,
      payload.title,
      new Types.ObjectId(payload.projectId),
    );
  }

  /**
   * Classifies a task title against categories defined on a project.
   * @param userId - Authenticated user id
   * @param title - Task title to classify
   * @param projectId - Project id that defines the allowed workflow categories
   */
  private async classifyTitleByProject(
    userId: Types.ObjectId,
    title: string,
    projectId: Types.ObjectId,
  ): Promise<TaskClassificationResultDto> {
    const categories = await this.workflowsService.listWorkflowCategories(
      userId,
      projectId,
    );

    if (!categories.length) {
      throw new BadRequestException(
        "Task project has no categories available for classification",
      );
    }

    return await this.aiService.classify(title, categories);
  }
}
