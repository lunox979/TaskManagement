import type { Task, TaskPriority, TaskReorderItem, TaskStatus, TaskUpdateRequest } from "../types/task";

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

export async function updateTask(id: number, request: TaskUpdateRequest): Promise<Task> {
  const res = await fetch(`${BASE_URL}/api/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function deleteTask(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/tasks/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
}

export async function reorderTasks(items: TaskReorderItem[]): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/tasks/reorder`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(items),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
}
