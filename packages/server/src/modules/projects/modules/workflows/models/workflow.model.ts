import { Document, Schema, SchemaTypes, Types } from "mongoose";

export const WORKFLOW_MODEL_TOKEN = "Workflow";

export interface Workflow extends Document {
  userId: Types.ObjectId;
  projectId?: Types.ObjectId;
  domain: string;
  title: string;
  description: string;
  categories: string[];
}

export const WorkflowSchema = new Schema<Workflow>({
  userId: { type: SchemaTypes.ObjectId, required: true },
  projectId: { type: SchemaTypes.ObjectId, required: false, ref: "Project" },
  domain: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  categories: [{ type: String, required: true }],
});
