import { z } from "zod";
import { objectIdSchema } from "../shared";
import { MAX_TASK_TITLE_LENGTH, MIN_TASK_TITLE_LENGTH } from "../../config";

export const manageTaskSchema = z.object({
  title: z.string().min(MIN_TASK_TITLE_LENGTH).max(MAX_TASK_TITLE_LENGTH),
  timeSeconds: z.number().int().nonnegative().optional(),
  classIds: z.array(objectIdSchema).optional(),
  projectId: objectIdSchema.optional(),
});

export type ManageTaskDto = z.infer<typeof manageTaskSchema>;
