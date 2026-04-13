import { Schema, Document, Types, SchemaTypes } from "mongoose";

export const TASK_MODEL_TOKEN = "Task";

export interface Task extends Document {
  title: string;
  classIds: Types.ObjectId[];
  userId: Types.ObjectId;
}

export const TaskSchema = new Schema<Task>({
  title: { type: String, required: true },
  classIds: [{ type: SchemaTypes.ObjectId }],
  userId: { type: SchemaTypes.ObjectId, required: true },
});
