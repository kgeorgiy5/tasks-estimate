import {
  ListMarketplaceWorkflowDto,
} from "@tasks-estimate/shared";
import { createApiClient } from "../../utils/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
const WORKFLOWS_BASE = "/projects/workflows";

/**
 * Lists marketplace workflows and optionally filters by domain.
 */
export async function listMarketplaceWorkflows(
  domain?: string,
): Promise<ListMarketplaceWorkflowDto> {
  const client = createApiClient(API_BASE ?? process.env.NEXT_PUBLIC_API_URL ?? "");
  const response = await client.get(`${WORKFLOWS_BASE}/marketplace`, {
    params: domain ? { domain } : undefined,
  });
  return response.data as ListMarketplaceWorkflowDto;
}

/**
 * Lists distinct workflow marketplace domains.
 */
export async function listMarketplaceDomains(): Promise<string[]> {
  const client = createApiClient(API_BASE ?? process.env.NEXT_PUBLIC_API_URL ?? "");
  const response = await client.get(`${WORKFLOWS_BASE}/marketplace/domains`);
  return response.data as string[];
}