import { Module } from "@nestjs/common";
import { ClassificationModule } from "./modules/classification/classification.module";
import { ProjectsModule } from "../projects/projects.module";
import { TasksService } from "./tasks.service";
import { MongooseModule } from "@nestjs/mongoose";
import {
  TASK_ENTRY_MODEL_TOKEN,
  TASK_MODEL_TOKEN,
  TaskEntrySchema,
  TaskSchema,
} from "./models";
import { TasksController } from "./tasks.controller";
import { AuthModule } from "../users/modules/auth/auth.module";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [
    ClassificationModule,
    MongooseModule.forFeature([
      { name: TASK_MODEL_TOKEN, schema: TaskSchema },
      { name: TASK_ENTRY_MODEL_TOKEN, schema: TaskEntrySchema },
    ]),
    AuthModule,
    UsersModule,
    ProjectsModule,
  ],
  providers: [TasksService],
  controllers: [TasksController],
})
export class TasksModule {}
