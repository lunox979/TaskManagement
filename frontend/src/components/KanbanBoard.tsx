import type { Task, TaskStatus } from "../types/task";
import KanbanColumn from "./KanbanColumn";

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "todo",        label: "未着手" },
  { status: "in_progress", label: "進行中" },
  { status: "done",        label: "完了" },
];

interface Props {
  tasks: Task[];
  onAddTask: () => void;
}

export default function KanbanBoard({ tasks, onAddTask }: Props) {
  const grouped = Object.fromEntries(
    COLUMNS.map(({ status }) => [
      status,
      tasks.filter((t) => t.status === status),
    ])
  ) as Record<TaskStatus, Task[]>;

  return (
    <div className="flex gap-5 p-6 overflow-x-auto items-start flex-1 bg-[#f4f5f7]">
      {COLUMNS.map(({ status, label }) => (
        <KanbanColumn
          key={status}
          label={label}
          tasks={grouped[status]}
          onAddTask={status === "todo" ? onAddTask : undefined}
        />
      ))}
    </div>
  );
}
