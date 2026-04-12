import { Schema, Document, Types, SchemaTypes } from "mongoose";
import { TASK_ENTRY_MODEL_TOKEN } from "../../tasks/models/task-entry.model";

export const USER_MODEL_TOKEN = "User";

export interface User extends Document {
  email: string;
  password: string;
  currentTaskEntryId?: Types.ObjectId;
}

export const UserSchema = new Schema<User>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  currentTaskEntryId: {
    type: SchemaTypes.ObjectId,
    ref: TASK_ENTRY_MODEL_TOKEN,
  },
});
