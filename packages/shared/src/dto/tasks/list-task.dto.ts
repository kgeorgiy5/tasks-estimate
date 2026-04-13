import { z } from "zod";
import { objectIdSchema } from "../shared";
import { projectIconSchema } from "../projects";

export const listTaskSchema = z.object({
  _id: objectIdSchema,
  title: z.string(),
  classIds: z.array(objectIdSchema).optional(),
  userId: objectIdSchema,
  projectId: objectIdSchema.optional(),
  projectTitle: z.string().optional(),
  projectIcon: projectIconSchema.optional(),
  projectColor: z.string().optional(),
  timeSeconds: z.number().int().nonnegative().optional(),
  entriesCount: z.number().int().nonnegative().optional(),
  lastEntryStartDateTime: z.string().optional(),
});

export type ListTaskDto = z.infer<typeof listTaskSchema>;
