import { Types } from "mongoose";

export type TaskInsertItem = {
  userId: Types.ObjectId;
  title?: string;
  classIds?: Array<Types.ObjectId | string>;
  projectId?: string | Types.ObjectId;
};
