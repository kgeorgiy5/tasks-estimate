import { Schema, Document, Types, SchemaTypes } from "mongoose";

export const PROJECT_MODEL_TOKEN = "Project";

export type ProjectIcon =
  | "gears"
  | "book"
  | "pen"
  | "bill"
  | "bag"
  | "hospital"
  | "burger"
  | "carrot"
  | "brush"
  | "screen"
  | "phone"
  | "dog"
  | "cat";

export interface Project extends Document {
  userId: Types.ObjectId;
  title: string;
  icon?: ProjectIcon;
  color?: string;
}

export const ProjectSchema = new Schema<Project>({
  userId: { type: SchemaTypes.ObjectId, required: true },
  title: { type: String, required: true },
  icon: { type: String, required: false },
  color: { type: String, required: false },
});
