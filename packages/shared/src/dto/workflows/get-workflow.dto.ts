import { z } from "zod";
import { objectIdSchema } from "../shared";

export const getWorkflowSchema = z.object({
  _id: objectIdSchema,
  userId: objectIdSchema,
  projectId: objectIdSchema,
  domain: z.string(),
  title: z.string(),
  description: z.string(),
  categories: z.array(z.string()),
});

export type GetWorkflowDto = z.infer<typeof getWorkflowSchema>;
