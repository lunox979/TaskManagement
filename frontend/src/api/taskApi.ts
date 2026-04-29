import type { Task, TaskPriority, TaskStatus } from "../types/task";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export async function fetchAllTasks(): Promise<Task[]> {
  const res = await fetch(`${BASE_URL}/api/tasks`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
}

export async function createTask(request: CreateTaskRequest): Promise<Task> {
  const res = await fetch(`${BASE_URL}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
