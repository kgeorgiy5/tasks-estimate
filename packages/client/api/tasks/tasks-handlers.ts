import { createApiClient } from "../../utils/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

const TASKS_BASE = "/tasks";

export async function createTask(payload: { title: string; classIds?: string[] }) {
  const client = createApiClient(API_BASE ?? process.env.NEXT_PUBLIC_API_URL ?? "");

  const response = await client.post(TASKS_BASE, payload);
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
