import { Types } from "mongoose";

export type TaskInsertItem = {
  userId: Types.ObjectId;
  title?: string;
  projectId?: string | Types.ObjectId;
  categories?: string[];
};
