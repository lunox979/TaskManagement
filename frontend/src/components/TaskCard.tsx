import type { Task, TaskPriority } from "../types/task";

const PRIORITY_MAP: Record<TaskPriority, { label: string; className: string }> = {
  high:   { label: "高", className: "text-red-600 bg-red-100" },
  medium: { label: "中", className: "text-amber-600 bg-amber-100" },
  low:    { label: "低", className: "text-blue-600 bg-blue-100" },
};

function formatDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${parseInt(m)}/${parseInt(d)}`;
}

interface Props {
  task: Task;
}

export default function TaskCard({ task }: Props) {
  const priority = task.priority ? PRIORITY_MAP[task.priority] : null;
  const hasMeta = priority !== null || task.dueDate !== null;

  return (
    <div className="bg-white rounded-md shadow-sm p-3 cursor-default">
      <p className="text-sm font-medium text-gray-800 leading-snug">{task.title}</p>
      {hasMeta && (
        <div className="flex items-center gap-2 mt-2">
          {priority && (
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${priority.className}`}>
              {priority.label}
            </span>
          )}
          {task.dueDate && (
            <span className="text-xs text-gray-500">{formatDate(task.dueDate)}</span>
          )}
        </div>
      )}
    </div>
  );
}
