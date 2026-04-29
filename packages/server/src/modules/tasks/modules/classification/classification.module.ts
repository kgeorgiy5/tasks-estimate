import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AiModule } from "../../../ai/ai.module";
import { AuthModule } from "../../../users/modules/auth/auth.module";
import { TASK_MODEL_TOKEN, TaskSchema } from "../../models";
import { WorkflowsModule } from "../../../projects/modules/workflows/workflows.module";
import { ClassificationController } from "./classification.controller";
import { DraftClassificationController } from "./draft-classification.controller";
import { ClassificationService } from "./classification.service";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: TASK_MODEL_TOKEN, schema: TaskSchema }]),
		AiModule,
		AuthModule,
		WorkflowsModule,
	],
	controllers: [ClassificationController, DraftClassificationController],
	providers: [ClassificationService],
})
export class ClassificationModule {}
