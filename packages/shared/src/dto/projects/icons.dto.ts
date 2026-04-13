import { z } from "zod";

export const projectIconSchema = z.enum([
  "gears",
  "book",
  "pen",
  "bill",
  "bag",
  "hospital",
  "burger",
  "carrot",
  "brush",
  "screen",
  "phone",
  "dog",
  "cat",
]);

export type ProjectIcon = z.infer<typeof projectIconSchema>;
