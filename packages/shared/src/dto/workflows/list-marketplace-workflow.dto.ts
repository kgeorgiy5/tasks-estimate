import { z } from "zod";
import { ErrorIds } from "../../config";
import { getMarketplaceWorkflowSchema } from "./get-marketplace-workflow.dto";

export const listMarketplaceWorkflowSchema = z.array(
  getMarketplaceWorkflowSchema,
  {
    error: ErrorIds.GENERIC_BAD_REQUEST,
  },
);

export type ListMarketplaceWorkflowDto = z.infer<
  typeof listMarketplaceWorkflowSchema
>;