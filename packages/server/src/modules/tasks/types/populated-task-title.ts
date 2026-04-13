import { Types } from "mongoose";

export type PopulatedTaskTitle = {
  _id: Types.ObjectId;
  title: string;
};
