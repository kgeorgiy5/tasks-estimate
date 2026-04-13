import { createApiClient } from "../../utils/api";
import { GetProjectDto, ListProjectDto, ManageProjectDto } from "@tasks-estimate/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

const PROJECTS_BASE = "/projects";

/**
 * Returns all projects for the current user.
 */
export async function listProjects(): Promise<ListProjectDto> {
  const client = createApiClient(API_BASE ?? process.env.NEXT_PUBLIC_API_URL ?? "");
  const response = await client.get(PROJECTS_BASE);
  return response.data as ListProjectDto;
}

/**
 * Creates a project for the current user.
 */
export async function createProject(payload: ManageProjectDto): Promise<GetProjectDto> {
  const client = createApiClient(API_BASE ?? process.env.NEXT_PUBLIC_API_URL ?? "");
  const response = await client.post(PROJECTS_BASE, payload);
  return response.data as GetProjectDto;
}

/**
 * Updates a project by id.
 */
export async function editProject(id: string, payload: ManageProjectDto): Promise<GetProjectDto> {
  const client = createApiClient(API_BASE ?? process.env.NEXT_PUBLIC_API_URL ?? "");
  const response = await client.put(`${PROJECTS_BASE}/${id}`, payload);
  return response.data as GetProjectDto;
}

/**
 * Deletes a project by id.
 */
export type DeleteProjectOptions = { id: string; cascade?: boolean };

export async function deleteProject({ id, cascade }: DeleteProjectOptions): Promise<void> {
  const client = createApiClient(API_BASE ?? process.env.NEXT_PUBLIC_API_URL ?? "");
  await client.delete(`${PROJECTS_BASE}/${id}`, { params: { cascade } });
}
