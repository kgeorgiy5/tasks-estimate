import { Module } from "@nestjs/common";
import { ClassificationModule } from "./modules/classification/classification.module";

@Module({
  imports: [ClassificationModule],
})
export class TasksModule {}
