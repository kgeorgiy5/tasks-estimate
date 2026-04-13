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
