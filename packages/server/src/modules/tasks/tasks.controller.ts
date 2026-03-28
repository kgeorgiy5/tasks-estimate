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
import { ManageTaskDto, manageTaskSchema } from "@tasks-estimate/shared";
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
    @Body(new ZodValidationPipe(manageTaskSchema)) taskPayload: ManageTaskDto,
  ) {
    const userId = new Types.ObjectId(req.user.sub);
    return await this.tasksService.saveTask(userId, taskPayload);
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
}
