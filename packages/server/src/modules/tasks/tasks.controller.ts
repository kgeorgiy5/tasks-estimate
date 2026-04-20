import {
  Body,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  Query,
  UseGuards,
} from "@nestjs/common";
import { TasksModuleController } from "./decorators";
import { TasksService } from "./tasks.service";
import { AuthGuard } from "../users/modules/auth/guards/auth.guard";
import { ZodValidationPipe } from "../../pipes";
import {
  CreateTaskDto,
  createTaskSchema,
  ListTaskEntryDto,
  ManageTaskDto,
  manageTaskSchema,
  paginationRequestSchema,
  PaginationRequestDto,
} from "@tasks-estimate/shared";
import { Types } from "mongoose";

@TasksModuleController()
@UseGuards(AuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  public async listTasks(
    @Req() req: any,
    @Query(new ZodValidationPipe(paginationRequestSchema))
    pagination: PaginationRequestDto,
  ) {
    const userId = new Types.ObjectId(req.user.sub);
    return await this.tasksService.listTasks(userId, pagination);
  }

  @Post()
  public async createTask(
    @Req() req: any,
    @Body(new ZodValidationPipe(createTaskSchema)) taskPayload: CreateTaskDto,
  ) {
    const userId = new Types.ObjectId(req.user.sub);
    return await this.tasksService.createTaskAndStartEntry(userId, taskPayload);
  }

  @Post("bulk")
  public async bulkCreateTasks(
    @Req() req: any,
    @Body() taskPayloads: ManageTaskDto[],
  ) {
    const userId = new Types.ObjectId(req.user.sub);
    return await this.tasksService.bulkCreateTasks(userId, taskPayloads);
  }

  @Put(":id")
  public async updateTask(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(manageTaskSchema)) taskPayload: ManageTaskDto,
  ) {
    const taskId = new Types.ObjectId(id);
    return await this.tasksService.updateTask(taskId, taskPayload);
  }

  @Delete(":id")
  public async deleteTask(@Param("id") id: string) {
    const taskId = new Types.ObjectId(id);
    return await this.tasksService.deleteTask(taskId);
  }

  /**
   * Starts a timer entry for a task.
   */
  @Post(":id/entries/start")
  public async startTaskEntry(@Req() req: any, @Param("id") id: string) {
    const userId = new Types.ObjectId(req.user.sub);
    const taskId = new Types.ObjectId(id);
    return await this.tasksService.startTaskEntry(userId, taskId);
  }

  /**
   * Ends the active timer entry for a task.
   */
  @Post(":id/entries/end")
  public async endTaskEntry(@Req() req: any, @Param("id") id: string) {
    const userId = new Types.ObjectId(req.user.sub);
    const taskId = new Types.ObjectId(id);
    return await this.tasksService.endTaskEntry(userId, taskId);
  }

  /**
   * Lists all entries for the authenticated user.
   */
  @Get("entries")
  public async listAllTaskEntries(@Req() req: any): Promise<ListTaskEntryDto[]> {
    const userId = new Types.ObjectId(req.user.sub);
    return await this.tasksService.listTaskEntries(userId);
  }

  /**
   * Lists all entries for a specific task.
   */
  @Get(":id/entries")
  public async listTaskEntries(
    @Req() req: any,
    @Param("id") id: string,
  ): Promise<ListTaskEntryDto[]> {
    const userId = new Types.ObjectId(req.user.sub);
    const taskId = new Types.ObjectId(id);
    return await this.tasksService.listTaskEntries(userId, taskId);
  }

  /**
   * Get the authenticated user's current running task entry.
   */
  @Get("current-entry")
  public async getCurrentEntry(@Req() req: any) {
    const userId = new Types.ObjectId(req.user.sub);
    return await this.tasksService.getCurrentTaskEntry(userId);
  }
}
