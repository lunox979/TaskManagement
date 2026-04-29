export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority | null;
  dueDate: string | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskUpdateRequest {
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority | null;
  dueDate: string | null;
}

export interface TaskReorderItem {
  id: number;
  orderIndex: number;
  status: TaskStatus;
}
