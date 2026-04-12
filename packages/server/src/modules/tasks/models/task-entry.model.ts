import { Schema, Document, Types, SchemaTypes } from "mongoose";
import { USER_MODEL_TOKEN } from "../../users/models/user.model";
import { TASK_MODEL_TOKEN } from "./task.model";

export const TASK_ENTRY_MODEL_TOKEN = "TaskEntry";

export interface TaskEntry extends Document {
  taskId: Types.ObjectId;
  timeSeconds: number;
  startDateTime: Date;
  endDateTime?: Date;
  userId: Types.ObjectId;
}

export const TaskEntrySchema = new Schema<TaskEntry>({
  taskId: { type: SchemaTypes.ObjectId, ref: TASK_MODEL_TOKEN, required: true },
  timeSeconds: { type: Number, required: true },
  startDateTime: { type: Date, required: true },
  endDateTime: { type: Date },
  userId: { type: SchemaTypes.ObjectId, ref: USER_MODEL_TOKEN, required: true },
});
