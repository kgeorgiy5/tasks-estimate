import z from "zod";
import { getProjectSchema } from "./get-project.dto";
import { ErrorIds } from "../../config";

export const listProjectSchema = z.array(getProjectSchema, {
  error: ErrorIds.GENERIC_BAD_REQUEST,
});

export type ListProjectDto = z.infer<typeof listProjectSchema>;
