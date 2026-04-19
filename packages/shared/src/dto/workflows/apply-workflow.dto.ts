import { z } from "zod";
import { objectIdSchema } from "../shared";

export const applyWorkflowSchema = z.object({
  projectId: objectIdSchema,
});

export type ApplyWorkflowDto = z.infer<typeof applyWorkflowSchema>;