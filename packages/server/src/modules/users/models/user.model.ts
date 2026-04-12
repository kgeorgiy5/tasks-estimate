import { Schema, Document, Types, SchemaTypes } from "mongoose";
import { TASK_MODEL_TOKEN } from "../../tasks/models/task.model";

export const USER_MODEL_TOKEN = "User";

export interface User extends Document {
  email: string;
  password: string;
  currentTaskId?: Types.ObjectId;
}

export const UserSchema = new Schema<User>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  currentTaskId: { type: SchemaTypes.ObjectId, ref: TASK_MODEL_TOKEN },
});
