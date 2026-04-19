import { Schema } from "mongoose";

export const WORKFLOW_MARKETPLACE_MODEL = "WorkflowMarketplace";

export interface MarketplaceWorkflow extends Document {
  domain: string;
  title: string;
  description: string;
  categories: string[];
}

export const MarketplaceWorkflowSchema = new Schema<MarketplaceWorkflow>({
  domain: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  categories: [{ type: String, required: true }],
});
