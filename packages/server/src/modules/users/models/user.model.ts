import { Schema, Document } from "mongoose";

export const USER_MODEL_TOKEN = "User";

export interface User extends Document {
  email: string;
  password: string;
}

export const UserSchema = new Schema<User>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
