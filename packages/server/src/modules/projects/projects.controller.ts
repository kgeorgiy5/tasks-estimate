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
import { ProjectsService } from "./projects.service";
import { AuthGuard } from "../users/modules/auth/guards/auth.guard";
import { ZodValidationPipe } from "../../pipes";
import { ManageProjectDto, manageProjectSchema } from "@tasks-estimate/shared";
import { Types } from "mongoose";
import { ProjectsModuleController } from "./decorators";

@UseGuards(AuthGuard)
@ProjectsModuleController()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  public async listProjects(@Req() req: any) {
    const userId = new Types.ObjectId(req.user.sub);
    return await this.projectsService.listProjects(userId);
  }

  @Post()
  public async createProject(
    @Req() req: any,
    @Body(new ZodValidationPipe(manageProjectSchema)) payload: ManageProjectDto,
  ) {
    const userId = new Types.ObjectId(req.user.sub);
    return await this.projectsService.createProject(userId, payload);
  }

  @Put(":id")
  public async updateProject(
    @Req() req: any,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(manageProjectSchema)) payload: ManageProjectDto,
  ) {
    const userId = new Types.ObjectId(req.user.sub);
    const projectId = new Types.ObjectId(id);
    return await this.projectsService.editProject(projectId, userId, payload);
  }

  @Delete(":id")
  public async deleteProject(
    @Req() req: any,
    @Param("id") id: string,
    @Query("cascade") cascade?: string,
  ) {
    const userId = new Types.ObjectId(req.user.sub);
    const projectId = new Types.ObjectId(id);
    const cascadeBool = cascade === "true" || cascade === "1";
    return await this.projectsService.deleteProject(
      projectId,
      userId,
      cascadeBool,
    );
  }
}
