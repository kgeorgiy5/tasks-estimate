import { Module, OnModuleInit } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PROJECT_MODEL_TOKEN, ProjectSchema } from "../../models";
import { WorkflowsController } from "./workflows.controller";
import {
  MarketplaceWorkflowSchema,
  WORKFLOW_MARKETPLACE_MODEL,
  WORKFLOW_MODEL_TOKEN,
  WorkflowSchema,
} from "./models";
import { WorkflowsService } from "./workflows.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WORKFLOW_MODEL_TOKEN, schema: WorkflowSchema },
      { name: PROJECT_MODEL_TOKEN, schema: ProjectSchema },
      { name: WORKFLOW_MARKETPLACE_MODEL, schema: MarketplaceWorkflowSchema },
    ]),
  ],
  controllers: [WorkflowsController],
  providers: [
    WorkflowsService,
    {
      provide: "WORKFLOWS_STARTUP",
      useFactory: (workflowsService: WorkflowsService) => {
        const startup = {
          async onModuleInit() {
            await workflowsService.initializeWorkflowMarketplace();
          },
        } as OnModuleInit;

        return startup;
      },
      inject: [WorkflowsService],
    },
  ],
  exports: [
    WorkflowsService,
    MongooseModule.forFeature([
      { name: WORKFLOW_MARKETPLACE_MODEL, schema: MarketplaceWorkflowSchema },
    ]),
  ],
})
export class WorkflowsModule {}
