import z from "zod";
import { objectIdSchema } from "../shared";
import { ErrorIds } from "../../config";

export const getProjectSchema = z.object({
  _id: objectIdSchema,
  userId: objectIdSchema,
  title: z.string(),
});

export type GetProjectDto = z.infer<typeof getProjectSchema>;
