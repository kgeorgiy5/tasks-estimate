import { Body, Post, Req, UseGuards } from "@nestjs/common";
import {
  ClassifyDraftTaskDto,
  classifyDraftTaskSchema,
} from "@tasks-estimate/shared";
import { Request } from "express";
import { Types } from "mongoose";
import { ZodValidationPipe } from "../../../../pipes";
import { TasksModuleController } from "../../decorators";
import { AuthGuard } from "../../../users/modules/auth/guards/auth.guard";
import { ClassificationService } from "./classification.service";

type AuthenticatedRequest = Request & {
  user: {
    sub: string;
  };
};

@UseGuards(AuthGuard)
@TasksModuleController("classification")
export class DraftClassificationController {
  /**
   * Creates a draft classification controller instance.
   * @param classificationService - Task classification orchestration service
   */
  public constructor(
    private readonly classificationService: ClassificationService,
  ) {}

  /**
   * Classifies a draft task before it is persisted.
   * @param req - Authenticated request
   * @param payload - Draft task payload required for classification
   */
  @Post("draft")
  public async classifyDraftTask(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(classifyDraftTaskSchema))
    payload: ClassifyDraftTaskDto,
  ) {
    const userId = new Types.ObjectId(req.user.sub);

    return await this.classificationService.classifyDraftTask(userId, payload);
  }
}