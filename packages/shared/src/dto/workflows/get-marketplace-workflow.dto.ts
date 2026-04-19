import { z } from "zod";
import { objectIdSchema } from "../shared";

export const getMarketplaceWorkflowSchema = z.object({
  _id: objectIdSchema,
  domain: z.string(),
  title: z.string(),
  description: z.string(),
  categories: z.array(z.string()),
});

export type GetMarketplaceWorkflowDto = z.infer<
  typeof getMarketplaceWorkflowSchema
>;