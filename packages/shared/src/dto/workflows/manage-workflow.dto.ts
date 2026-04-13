import { z } from "zod";
import { MAX_TASK_TITLE_LENGTH, MIN_TASK_TITLE_LENGTH } from "../../config";
import { objectIdSchema } from "../shared";

export const manageWorkflowSchema = z.object({
  projectId: objectIdSchema,
  domain: z.string().min(MIN_TASK_TITLE_LENGTH).max(MAX_TASK_TITLE_LENGTH),
  title: z.string().min(MIN_TASK_TITLE_LENGTH).max(MAX_TASK_TITLE_LENGTH),
  description: z.string().min(MIN_TASK_TITLE_LENGTH),
  categories: z.array(z.string()).min(1),
});

export type ManageWorkflowDto = z.infer<typeof manageWorkflowSchema>;
