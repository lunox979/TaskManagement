import { useRef, useState } from "react";
import type { Task, TaskReorderItem, TaskStatus, TaskUpdateRequest } from "../types/task";
import { reorderTasks, updateTask } from "../api/taskApi";
import KanbanColumn from "./KanbanColumn";
import TaskDetailModal from "./TaskDetailModal";

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "todo", label: "未着手" },
  { status: "in_progress", label: "進行中" },
  { status: "done", label: "完了" },
];

interface DropIndicator {
  beforeTaskId: number | null;
  status: TaskStatus;
}

interface Props {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
  onAddTask: () => void;
}

export default function KanbanBoard({ tasks, onTasksChange, onAddTask }: Props) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dropIndicator, setDropIndicator] = useState<DropIndicator | null>(null);
  const dragIdRef = useRef<number | null>(null);

  const grouped = Object.fromEntries(
    COLUMNS.map(({ status }) => [
      status,
      [...tasks.filter((t) => t.status === status)].sort(
        (a, b) => a.orderIndex - b.orderIndex
      ),
    ])
  ) as Record<TaskStatus, Task[]>;

  function handleDragStart(taskId: number) {
    dragIdRef.current = taskId;
    setDraggingId(taskId);
  }

  function handleDragEnd() {
    dragIdRef.current = null;
    setDraggingId(null);
    setDropIndicator(null);
  }

  function handleDragOverColumn(status: TaskStatus) {
    setDropIndicator({ beforeTaskId: null, status });
  }

  function handleDragOverCard(taskId: number, status: TaskStatus, above: boolean) {
    if (above) {
      setDropIndicator({ beforeTaskId: taskId, status });
    } else {
      const colTasks = grouped[status];
      const idx = colTasks.findIndex((t) => t.id === taskId);
      const next = colTasks[idx + 1];
      setDropIndicator({ beforeTaskId: next ? next.id : null, status });
    }
  }

  function handleDrop(targetStatus: TaskStatus) {
    const id = dragIdRef.current;
    if (id == null) return;

    const dragged = tasks.find((t) => t.id === id);
    if (!dragged) return;

    const targetColTasks = grouped[targetStatus].filter((t) => t.id !== id);
    const insertBefore = dropIndicator?.beforeTaskId ?? null;

    let insertIdx = targetColTasks.length;
    if (insertBefore != null) {
      const idx = targetColTasks.findIndex((t) => t.id === insertBefore);
      if (idx !== -1) insertIdx = idx;
    }

    targetColTasks.splice(insertIdx, 0, { ...dragged, status: targetStatus });

    const reorderItems: TaskReorderItem[] = [];

    // Recalculate target column orderIndex
    targetColTasks.forEach((t, i) => {
      reorderItems.push({ id: t.id, orderIndex: i, status: targetStatus });
    });

    // Recalculate source column if different
    if (dragged.status !== targetStatus) {
      grouped[dragged.status]
        .filter((t) => t.id !== id)
        .forEach((t, i) => {
          reorderItems.push({ id: t.id, orderIndex: i, status: dragged.status });
        });
    }

    // Apply optimistic update
    const updatedMap = new Map(reorderItems.map((r) => [r.id, r]));
    const nextTasks = tasks.map((t) => {
      const updated = updatedMap.get(t.id);
      if (updated) return { ...t, orderIndex: updated.orderIndex, status: updated.status };
      return t;
    });
    onTasksChange(nextTasks);

    setDraggingId(null);
    setDropIndicator(null);
    dragIdRef.current = null;

    reorderTasks(reorderItems).catch(() => {
      // Revert on failure
      onTasksChange(tasks);
    });
  }

  async function handleSaveTask(id: number, request: TaskUpdateRequest) {
    const updated = await updateTask(id, request);
    onTasksChange(tasks.map((t) => (t.id === id ? updated : t)));
    setSelectedTask(updated);
  }

  return (
    <>
      <div className="flex gap-5 p-6 overflow-x-auto items-start flex-1 bg-[#f4f5f7]">
        {COLUMNS.map(({ status, label }) => (
          <KanbanColumn
            key={status}
            label={label}
            status={status}
            tasks={grouped[status]}
            draggingId={draggingId}
            dropIndicator={dropIndicator}
            onAddTask={status === "todo" ? onAddTask : undefined}
            onTaskClick={setSelectedTask}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOverColumn={handleDragOverColumn}
            onDragOverCard={handleDragOverCard}
            onDrop={handleDrop}
          />
        ))}
      </div>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSave={handleSaveTask}
        />
      )}
    </>
  );
}
