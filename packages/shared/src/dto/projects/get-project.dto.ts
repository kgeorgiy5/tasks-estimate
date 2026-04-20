import z from "zod";
import { objectIdSchema } from "../shared";
import { projectIconSchema } from "./icons.dto";

export const getProjectSchema = z.object({
  _id: objectIdSchema,
  userId: objectIdSchema,
  title: z.string(),
  icon: projectIconSchema.optional(),
  color: z.string().optional(),
  workflowId: objectIdSchema.optional(),
});

export type GetProjectDto = z.infer<typeof getProjectSchema>;
