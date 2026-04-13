import { z } from "zod";
import { MIN_TASK_TITLE_LENGTH, MAX_TASK_TITLE_LENGTH } from "../../config";

export const manageProjectSchema = z.object({
  title: z.string().min(MIN_TASK_TITLE_LENGTH).max(MAX_TASK_TITLE_LENGTH),
});

export type ManageProjectDto = z.infer<typeof manageProjectSchema>;
