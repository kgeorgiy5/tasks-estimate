import { z } from "zod";
import { objectIdSchema } from "../shared";

export const listTaskSchema = z.object({
  _id: objectIdSchema,
  title: z.string(),
  classIds: z.array(objectIdSchema).optional(),
  userId: objectIdSchema,
  timeSeconds: z.number().int().nonnegative().optional(),
  entriesCount: z.number().int().nonnegative().optional(),
  lastEntryStartDateTime: z.string().optional(),
});

export type ListTaskDto = z.infer<typeof listTaskSchema>;
