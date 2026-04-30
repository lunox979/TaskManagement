import { useRef, useState } from "react";
import type { Task, TaskReorderItem, TaskStatus, TaskUpdateRequest } from "../types/task";
import { deleteTask, reorderTasks, updateTask } from "../api/taskApi";
import KanbanColumn from "./KanbanColumn";
import TaskDetailModal from "./TaskDetailModal";

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "todo", label: "未着手" },
  { status: "in_progress", label: "進行中" },
  { status: "done", label: "完了" },
];

export type SortKey = "priority" | "dueDate";

interface SortState {
  key: SortKey | null;
  asc: boolean;
}

interface DropIndicator {
  beforeTaskId: number | null;
  status: TaskStatus;
}

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

function sortColumnTasks(tasks: Task[], sort: SortState): Task[] {
  if (!sort.key) return tasks;
  return [...tasks].sort((a, b) => {
    if (sort.key === "priority") {
      const aVal = a.priority != null ? (PRIORITY_ORDER[a.priority] ?? 3) : 3;
      const bVal = b.priority != null ? (PRIORITY_ORDER[b.priority] ?? 3) : 3;
      return sort.asc ? aVal - bVal : bVal - aVal;
    } else {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return sort.asc ? 1 : -1;
      if (!b.dueDate) return sort.asc ? -1 : 1;
      const cmp = a.dueDate.localeCompare(b.dueDate);
      return sort.asc ? cmp : -cmp;
    }
  });
}

interface Props {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
  onAddTask: (status: TaskStatus) => void;
}

export default function KanbanBoard({ tasks, onTasksChange, onAddTask }: Props) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dropIndicator, setDropIndicator] = useState<DropIndicator | null>(null);
  const [sortStates, setSortStates] = useState<Record<TaskStatus, SortState>>({
    todo: { key: null, asc: true },
    in_progress: { key: null, asc: true },
    done: { key: null, asc: true },
  });
  const dragIdRef = useRef<number | null>(null);

  const grouped = Object.fromEntries(
    COLUMNS.map(({ status }) => {
      const colTasks = [...tasks.filter((t) => t.status === status)].sort(
        (a, b) => a.orderIndex - b.orderIndex
      );
      return [status, sortColumnTasks(colTasks, sortStates[status])];
    })
  ) as Record<TaskStatus, Task[]>;

  function handleSort(status: TaskStatus, key: SortKey) {
    const current = sortStates[status];
    const asc = current.key === key ? !current.asc : true;
    const newSort: SortState = { key, asc };

    setSortStates((prev) => ({ ...prev, [status]: newSort }));

    const colTasks = [...tasks.filter((t) => t.status === status)].sort(
      (a, b) => a.orderIndex - b.orderIndex
    );
    const sorted = sortColumnTasks(colTasks, newSort);
    const reorderItems: TaskReorderItem[] = sorted.map((t, i) => ({
      id: t.id,
      orderIndex: i,
      status: t.status,
    }));

    const updatedMap = new Map(reorderItems.map((r) => [r.id, r]));
    const nextTasks = tasks.map((t) => {
      const updated = updatedMap.get(t.id);
      return updated ? { ...t, orderIndex: updated.orderIndex } : t;
    });
    onTasksChange(nextTasks);

    reorderTasks(reorderItems).catch(() => onTasksChange(tasks));
  }

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
    targetColTasks.forEach((t, i) => {
      reorderItems.push({ id: t.id, orderIndex: i, status: targetStatus });
    });

    if (dragged.status !== targetStatus) {
      grouped[dragged.status]
        .filter((t) => t.id !== id)
        .forEach((t, i) => {
          reorderItems.push({ id: t.id, orderIndex: i, status: dragged.status });
        });
    }

    const updatedMap = new Map(reorderItems.map((r) => [r.id, r]));
    const nextTasks = tasks.map((t) => {
      const updated = updatedMap.get(t.id);
      if (updated) return { ...t, orderIndex: updated.orderIndex, status: updated.status };
      return t;
    });
    onTasksChange(nextTasks);

    // ドラッグ後はそのカラムのソートをリセット
    if (dragged.status !== targetStatus) {
      setSortStates((prev) => ({
        ...prev,
        [targetStatus]: { key: null, asc: true },
        [dragged.status]: { key: null, asc: true },
      }));
    } else {
      setSortStates((prev) => ({ ...prev, [targetStatus]: { key: null, asc: true } }));
    }

    setDraggingId(null);
    setDropIndicator(null);
    dragIdRef.current = null;

    reorderTasks(reorderItems).catch(() => onTasksChange(tasks));
  }

  async function handleSaveTask(id: number, request: TaskUpdateRequest) {
    const updated = await updateTask(id, request);
    onTasksChange(tasks.map((t) => (t.id === id ? updated : t)));
    setSelectedTask(updated);
  }

  async function handleDeleteTask(id: number) {
    await deleteTask(id);
    onTasksChange(tasks.filter((t) => t.id !== id));
    setSelectedTask(null);
  }

  async function handleStatusChange(id: number, nextStatus: TaskStatus) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const request: TaskUpdateRequest = {
      title: task.title,
      description: task.description,
      status: nextStatus,
      priority: task.priority,
      dueDate: task.dueDate,
    };
    const updated = await updateTask(id, request);
    onTasksChange(tasks.map((t) => (t.id === id ? updated : t)));
  }

  async function handleTitleChange(id: number, title: string) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const request: TaskUpdateRequest = {
      title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
    };
    const updated = await updateTask(id, request);
    onTasksChange(tasks.map((t) => (t.id === id ? updated : t)));
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
            sortState={sortStates[status]}
            onSort={(key) => handleSort(status, key)}
            onAddTask={() => onAddTask(status)}
            onTaskClick={setSelectedTask}
            onTaskDelete={handleDeleteTask}
            onTaskStatusChange={handleStatusChange}
            onTaskTitleChange={handleTitleChange}
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
          onDelete={handleDeleteTask}
        />
      )}
    </>
  );
}
