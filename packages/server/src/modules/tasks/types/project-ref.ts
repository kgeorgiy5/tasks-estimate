import { Types } from "mongoose";

/**
 * Project reference can be stored as ObjectId, populated object, or string.
 */
export type ProjectRef =
  | Types.ObjectId
  | { _id: Types.ObjectId; title?: string }
  | string;
