import { Module } from "@nestjs/common";
import { ProjectsService } from "./projects.service";
import { ProjectsController } from "./projects.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { PROJECT_MODEL_TOKEN, ProjectSchema } from "./models";
import { WorkflowsModule } from "./modules/workflows/workflows.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PROJECT_MODEL_TOKEN, schema: ProjectSchema },
    ]),
    WorkflowsModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [
    MongooseModule.forFeature([
      { name: PROJECT_MODEL_TOKEN, schema: ProjectSchema },
    ]),
  ],
})
export class ProjectsModule {}
