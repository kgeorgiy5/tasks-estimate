import {
  Body,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from "@nestjs/common";
import { TasksModuleController } from "./decorators";
import { TasksService } from "./tasks.service";
import { AuthGuard } from "../users/modules/auth/guards/auth.guard";
import { ZodValidationPipe } from "../../pipes";
import {
  CreateTaskDto,
  createTaskSchema,
  ManageTaskDto,
  manageTaskSchema,
} from "@tasks-estimate/shared";
import { Types } from "mongoose";

@TasksModuleController()
@UseGuards(AuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  public async listTasks(@Req() req: any) {
    const userId = new Types.ObjectId(req.user.sub);
    return await this.tasksService.listTasks(userId);
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
}
