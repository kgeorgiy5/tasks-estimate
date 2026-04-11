import { Module } from "@nestjs/common";
import { ClassificationModule } from "./modules/classification/classification.module";
import { TasksService } from "./tasks.service";
import { MongooseModule } from "@nestjs/mongoose";
import { TASK_MODEL_TOKEN, TaskSchema } from "./models";
import { TasksController } from "./tasks.controller";
import { AuthModule } from "../users/modules/auth/auth.module";

@Module({
  imports: [
    ClassificationModule,
    MongooseModule.forFeature([{ name: TASK_MODEL_TOKEN, schema: TaskSchema }]),
    AuthModule,
  ],
  providers: [TasksService],
  controllers: [TasksController],
})
export class TasksModule {}
