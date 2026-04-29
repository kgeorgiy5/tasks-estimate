import { z } from "zod";
import { objectIdSchema } from "../shared";
import { MAX_TASK_TITLE_LENGTH, MIN_TASK_TITLE_LENGTH } from "../../config";

export const classifyDraftTaskSchema = z.object({
  title: z.string().min(MIN_TASK_TITLE_LENGTH).max(MAX_TASK_TITLE_LENGTH),
  projectId: objectIdSchema,
});

export type ClassifyDraftTaskDto = z.infer<typeof classifyDraftTaskSchema>;

export const taskClassificationResultSchema = z.object({
  categories: z.array(z.string()),
});

export type TaskClassificationResultDto = z.infer<
  typeof taskClassificationResultSchema
>;