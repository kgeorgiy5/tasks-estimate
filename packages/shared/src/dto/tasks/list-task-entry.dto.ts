import { z } from "zod";
import { objectIdSchema } from "../shared";

export const listTaskEntrySchema = z.object({
  _id: objectIdSchema,
  taskId: objectIdSchema,
  taskTitle: z.string(),
  projectId: objectIdSchema.optional(),
  projectTitle: z.string().optional(),
  projectIcon: z.string().optional(),
  projectColor: z.string().optional(),
  userId: objectIdSchema,
  timeSeconds: z.number().int().nonnegative(),
  startDateTime: z.string(),
  endDateTime: z.string().nullable(),
});

export const listTaskEntriesSchema = z.array(listTaskEntrySchema);

export type ListTaskEntryDto = z.infer<typeof listTaskEntrySchema>;
