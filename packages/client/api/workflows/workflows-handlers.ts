import {
  ApplyWorkflowDto,
  GetWorkflowDto,
  ListMarketplaceWorkflowDto,
  ListUserWorkflowsDto,
  ManageWorkflowDto,
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

/**
 * Lists workflows owned by the authenticated user.
 */
export async function listMyWorkflows(): Promise<ListUserWorkflowsDto> {
  const client = createApiClient(API_BASE ?? process.env.NEXT_PUBLIC_API_URL ?? "");
  const response = await client.get(`${WORKFLOWS_BASE}/my`);
  return response.data as ListUserWorkflowsDto;
}

/**
 * Applies one workflow to another project.
 */
export async function applyWorkflowToProject(
  workflowId: string,
  payload: ApplyWorkflowDto,
): Promise<GetWorkflowDto> {
  const client = createApiClient(API_BASE ?? process.env.NEXT_PUBLIC_API_URL ?? "");
  const response = await client.post(`${WORKFLOWS_BASE}/${workflowId}/apply`, payload);
  return response.data as GetWorkflowDto;
}

/**
 * Updates existing workflow data.
 */
export async function editWorkflow(
  workflowId: string,
  payload: ManageWorkflowDto,
): Promise<GetWorkflowDto> {
  const client = createApiClient(API_BASE ?? process.env.NEXT_PUBLIC_API_URL ?? "");
  const response = await client.put(`${WORKFLOWS_BASE}/${workflowId}`, payload);
  return response.data as GetWorkflowDto;
}

/**
 * Deletes a workflow by id.
 */
export async function deleteWorkflow(workflowId: string): Promise<void> {
  const client = createApiClient(API_BASE ?? process.env.NEXT_PUBLIC_API_URL ?? "");
  await client.delete(`${WORKFLOWS_BASE}/${workflowId}`);
}