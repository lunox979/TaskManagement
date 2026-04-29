import type { Task } from "../types/task";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export async function fetchAllTasks(): Promise<Task[]> {
  const res = await fetch(`${BASE_URL}/api/tasks`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
