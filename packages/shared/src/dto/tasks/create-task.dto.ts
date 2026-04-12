import { z } from "zod";
import { objectIdSchema } from "../shared";
import { MAX_TASK_TITLE_LENGTH, MIN_TASK_TITLE_LENGTH } from "../../config";

export const createTaskSchema = z.object({
  title: z.string().min(MIN_TASK_TITLE_LENGTH).max(MAX_TASK_TITLE_LENGTH),
  classIds: z.array(objectIdSchema).optional(),
});

export type CreateTaskDto = z.infer<typeof createTaskSchema>;
