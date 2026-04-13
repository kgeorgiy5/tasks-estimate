import { z } from "zod";
import { ErrorIds } from "../../config";
import { objectIdSchema } from "../shared";

export const listUserWorkflowSchema = z.object({
  _id: objectIdSchema,
  userId: objectIdSchema,
  projectId: objectIdSchema,
  projectTitle: z.string().optional(),
  domain: z.string(),
  title: z.string(),
  description: z.string(),
  categories: z.array(z.string()),
});

export const listUserWorkflowsSchema = z.array(listUserWorkflowSchema, {
  error: ErrorIds.GENERIC_BAD_REQUEST,
});

export type ListUserWorkflowDto = z.infer<typeof listUserWorkflowSchema>;
export type ListUserWorkflowsDto = z.infer<typeof listUserWorkflowsSchema>;