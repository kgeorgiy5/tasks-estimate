import { Module } from "@nestjs/common";
import { ClassificationModule } from "./modules/classification/classification.module";
import { TasksService } from "./tasks.service";
import { MongooseModule } from "@nestjs/mongoose";
import { TASK_MODEL_TOKEN, TaskSchema } from "./models";

@Module({
  imports: [
    ClassificationModule,
    MongooseModule.forFeature([{ name: TASK_MODEL_TOKEN, schema: TaskSchema }]),
  ],
  providers: [TasksService],
})
export class TasksModule {}
