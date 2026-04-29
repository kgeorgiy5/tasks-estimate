import { createApiClient } from "../../utils/api";
import {
  ClassifyDraftTaskDto,
  CreateTaskDto,
  TaskClassificationResultDto,
} from "@tasks-estimate/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

const TASKS_BASE = "/tasks";

/**
 * Creates a new task for the current user.
 */
export async function createTask(payload: CreateTaskDto) {
  const client = createApiClient(API_BASE ?? process.env.NEXT_PUBLIC_API_URL ?? "");

  const response = await client.post(TASKS_BASE, payload);
  return response.data;
}

/**
 * Classifies a draft task before it is created.
 */
export async function classifyDraftTask(
  payload: ClassifyDraftTaskDto,
): Promise<TaskClassificationResultDto> {
  const client = createApiClient(API_BASE ?? process.env.NEXT_PUBLIC_API_URL ?? "");
  const response = await client.post(`${TASKS_BASE}/classification/draft`, payload);

  return response.data;
}

export async function startTaskEntry(taskId: string) {
  const client = createApiClient(API_BASE ?? process.env.NEXT_PUBLIC_API_URL ?? "");
  const response = await client.post(`${TASKS_BASE}/${taskId}/entries/start`);
  return response.data;
}

export async function endTaskEntry(taskId: string) {
  const client = createApiClient(API_BASE ?? process.env.NEXT_PUBLIC_API_URL ?? "");
  const response = await client.post(`${TASKS_BASE}/${taskId}/entries/end`);
  return response.data;
}

export async function getCurrentEntry() {
  const client = createApiClient(API_BASE ?? process.env.NEXT_PUBLIC_API_URL ?? "");
  const response = await client.get(`${TASKS_BASE}/current-entry`);
  return response.data;
}

export async function listTasks(offset = 0, limit = 20) {
  const client = createApiClient(API_BASE ?? process.env.NEXT_PUBLIC_API_URL ?? "");
  const response = await client.get(TASKS_BASE, { params: { offset, limit } });
  return response.data;
}

export async function listTaskEntries(taskId?: string) {
  const client = createApiClient(API_BASE ?? process.env.NEXT_PUBLIC_API_URL ?? "");
  const path = taskId ? `${TASKS_BASE}/${taskId}/entries` : `${TASKS_BASE}/entries`;
  const response = await client.get(path);
  return response.data;
}
