import { Schema, Document, Types, SchemaTypes } from "mongoose";

export const PROJECT_MODEL_TOKEN = "Project";

export interface Project extends Document {
  userId: Types.ObjectId;
  title: string;
}

export const ProjectSchema = new Schema<Project>({
  userId: { type: SchemaTypes.ObjectId, required: true },
  title: { type: String, required: true },
});
