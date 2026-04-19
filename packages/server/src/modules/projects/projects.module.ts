import { Module } from "@nestjs/common";
import { ProjectsService } from "./projects.service";
import { ProjectsController } from "./projects.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { PROJECT_MODEL_TOKEN, ProjectSchema } from "./models";
import { WorkflowsModule } from "./modules/workflows/workflows.module";
import {
  TASK_MODEL_TOKEN,
  TASK_ENTRY_MODEL_TOKEN,
  TaskSchema,
  TaskEntrySchema,
} from "../tasks/models";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PROJECT_MODEL_TOKEN, schema: ProjectSchema },
      { name: TASK_MODEL_TOKEN, schema: TaskSchema },
      { name: TASK_ENTRY_MODEL_TOKEN, schema: TaskEntrySchema },
    ]),
    WorkflowsModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [
    MongooseModule.forFeature([
      { name: PROJECT_MODEL_TOKEN, schema: ProjectSchema },
      { name: TASK_MODEL_TOKEN, schema: TaskSchema },
      { name: TASK_ENTRY_MODEL_TOKEN, schema: TaskEntrySchema },
    ]),
  ],
})
export class ProjectsModule {}
