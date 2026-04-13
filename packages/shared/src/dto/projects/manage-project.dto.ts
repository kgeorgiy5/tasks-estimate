import { z } from "zod";
import { MIN_TASK_TITLE_LENGTH, MAX_TASK_TITLE_LENGTH } from "../../config";
import { projectIconSchema } from "./icons.dto";

export const manageProjectSchema = z.object({
  title: z.string().min(MIN_TASK_TITLE_LENGTH).max(MAX_TASK_TITLE_LENGTH),
  icon: projectIconSchema.optional(),
  color: z.string().optional(),
});

export type ManageProjectDto = z.infer<typeof manageProjectSchema>;
