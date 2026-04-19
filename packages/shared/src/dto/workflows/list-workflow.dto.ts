import { z } from "zod";
import { ErrorIds } from "../../config";
import { getWorkflowSchema } from "./get-workflow.dto";

export const listWorkflowSchema = z.array(getWorkflowSchema, {
  error: ErrorIds.GENERIC_BAD_REQUEST,
});

export type ListWorkflowDto = z.infer<typeof listWorkflowSchema>;
