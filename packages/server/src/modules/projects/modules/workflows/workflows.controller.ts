import {
  Body,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApplyWorkflowDto,
  applyWorkflowSchema,
  ManageWorkflowDto,
  manageWorkflowSchema,
  objectIdSchema,
} from "@tasks-estimate/shared";
import { Request } from "express";
import { Types } from "mongoose";
import { z } from "zod";
import { ZodValidationPipe } from "../../../../pipes";
import { AuthGuard } from "../../../users/modules/auth/guards/auth.guard";
import { WorkflowsService } from "./workflows.service";
import { ProjectsModuleController } from "../../decorators";

type AuthenticatedRequest = Request & {
  user: {
    sub: string;
  };
};

const listWorkflowsQuerySchema = z.object({
  projectId: objectIdSchema,
});

const listMarketplaceWorkflowsQuerySchema = z.object({
  domain: z.string().trim().min(1).optional(),
});

type ListWorkflowsQueryDto = z.infer<typeof listWorkflowsQuerySchema>;
type ListMarketplaceWorkflowsQueryDto = z.infer<
  typeof listMarketplaceWorkflowsQuerySchema
>;

@UseGuards(AuthGuard)
@ProjectsModuleController("workflows")
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  /**
   * Lists workflows for a project owned by the authenticated user.
   */
  @Get()
  public async listWorkflows(
    @Req() req: AuthenticatedRequest,
    @Query(new ZodValidationPipe(listWorkflowsQuerySchema))
    query: ListWorkflowsQueryDto,
  ) {
    const userId = new Types.ObjectId(req.user.sub);
    return await this.workflowsService.listWorkflows(
      userId,
      new Types.ObjectId(query.projectId),
    );
  }

  /**
   * Lists distinct workflow categories for a project (path param).
   */
  @Get(":projectId/categories")
  public async listWorkflowCategoriesByProject(
    @Req() req: AuthenticatedRequest,
    @Param("projectId") projectId: string,
  ) {
    const userId = new Types.ObjectId(req.user.sub);
    return await this.workflowsService.listWorkflowCategories(
      userId,
      new Types.ObjectId(projectId),
    );
  }

  /**
   * Lists marketplace workflows (pre-seeded templates).
   */
  @Get("marketplace")
  public async listMarketplace(
    @Query(new ZodValidationPipe(listMarketplaceWorkflowsQuerySchema))
    query: ListMarketplaceWorkflowsQueryDto,
  ) {
    return await this.workflowsService.listMarketplaceWorkflows(query.domain);
  }

  /**
   * Lists distinct domains from the marketplace.
   */
  @Get("marketplace/domains")
  public async listMarketplaceDomains() {
    return await this.workflowsService.listMarketplaceDomains();
  }

  /**
   * Lists all workflows owned by the authenticated user.
   */
  @Get("my")
  public async listMyWorkflows(@Req() req: AuthenticatedRequest) {
    const userId = new Types.ObjectId(req.user.sub);
    return await this.workflowsService.listUserWorkflows(userId);
  }

  /**
   * Creates a workflow for the authenticated user.
   */
  @Post()
  public async createWorkflow(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(manageWorkflowSchema))
    payload: ManageWorkflowDto,
  ) {
    const userId = new Types.ObjectId(req.user.sub);
    return await this.workflowsService.createWorkflow(userId, payload);
  }

  /**
   * Applies an existing workflow to another project owned by the user.
   */
  @Post(":id/apply")
  public async applyWorkflowToAnotherProject(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(applyWorkflowSchema))
    payload: ApplyWorkflowDto,
  ) {
    const userId = new Types.ObjectId(req.user.sub);
    const workflowId = new Types.ObjectId(id);

    return await this.workflowsService.applyWorkflowToProject(
      workflowId,
      userId,
      payload,
    );
  }

  /**
   * Updates an existing workflow for the authenticated user.
   */
  @Put(":id")
  public async updateWorkflow(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(manageWorkflowSchema))
    payload: ManageWorkflowDto,
  ) {
    const userId = new Types.ObjectId(req.user.sub);
    const workflowId = new Types.ObjectId(id);
    return await this.workflowsService.editWorkflow(
      workflowId,
      userId,
      payload,
    );
  }

  /**
   * Deletes a workflow for the authenticated user.
   */
  @Delete(":id")
  public async deleteWorkflow(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
  ) {
    const userId = new Types.ObjectId(req.user.sub);
    const workflowId = new Types.ObjectId(id);
    return await this.workflowsService.deleteWorkflow(workflowId, userId);
  }
}
