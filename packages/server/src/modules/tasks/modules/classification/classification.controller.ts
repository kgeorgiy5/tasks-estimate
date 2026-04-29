import { Param, Post, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { Types } from "mongoose";
import { TasksModuleController } from "../../decorators";
import { AuthGuard } from "../../../users/modules/auth/guards/auth.guard";
import { ClassificationService } from "./classification.service";

type AuthenticatedRequest = Request & {
  user: {
    sub: string;
  };
};

@UseGuards(AuthGuard)
@TasksModuleController(":id/classification")
export class ClassificationController {
  /**
   * Creates a classification controller instance.
   * @param classificationService - Task classification orchestration service
   */
  public constructor(
    private readonly classificationService: ClassificationService,
  ) {}

  /**
   * Classifies a task by title and persists the assigned categories.
   * @param req - Authenticated request
   * @param id - Task id
   */
  @Post()
  public async classifyTask(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
  ) {
    const userId = new Types.ObjectId(req.user.sub);
    const taskId = new Types.ObjectId(id);

    return await this.classificationService.classifyTask(userId, taskId);
  }
}