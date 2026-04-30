import type { Task, TaskStatus } from "../types/task";
import type { SortKey } from "./KanbanBoard";
import TaskCard from "./TaskCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Circle, Timer, CheckCircle2, Plus, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

interface SortState {
  key: SortKey | null;
  asc: boolean;
}

interface DropIndicator {
  beforeTaskId: number | null;
  status: TaskStatus;
}

interface Props {
  label: string;
  status: TaskStatus;
  tasks: Task[];
  draggingId: number | null;
  dropIndicator: DropIndicator | null;
  sortState: SortState;
  onSort: (key: SortKey) => void;
  onAddTask?: () => void;
  onTaskClick: (task: Task) => void;
  onTaskDelete: (taskId: number) => void;
  onTaskStatusChange: (taskId: number, nextStatus: TaskStatus) => void;
  onTaskTitleChange: (taskId: number, title: string) => void;
  onDragStart: (taskId: number) => void;
  onDragEnd: () => void;
  onDragOverColumn: (status: TaskStatus) => void;
  onDragOverCard: (taskId: number, status: TaskStatus, above: boolean) => void;
  onDrop: (status: TaskStatus) => void;
}

const SORT_BUTTONS: { key: SortKey; label: string }[] = [
  { key: "priority", label: "優先度" },
  { key: "dueDate", label: "期限" },
];

const STATUS_CONFIG: Record<TaskStatus, {
  Icon: React.ElementType;
  topBorder: string;
  iconColor: string;
}> = {
  todo: {
    Icon: Circle,
    topBorder: "border-t-slate-400",
    iconColor: "text-slate-400",
  },
  in_progress: {
    Icon: Timer,
    topBorder: "border-t-indigo-500",
    iconColor: "text-indigo-500",
  },
  done: {
    Icon: CheckCircle2,
    topBorder: "border-t-emerald-500",
    iconColor: "text-emerald-500",
  },
};

export default function KanbanColumn({
  label,
  status,
  tasks,
  draggingId,
  dropIndicator,
  sortState,
  onSort,
  onAddTask,
  onTaskClick,
  onTaskDelete,
  onTaskStatusChange,
  onTaskTitleChange,
  onDragStart,
  onDragEnd,
  onDragOverColumn,
  onDragOverCard,
  onDrop,
}: Props) {
  const isDropTarget = dropIndicator?.status === status;
  const { Icon, topBorder, iconColor } = STATUS_CONFIG[status];

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    onDragOverColumn(status);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    onDrop(status);
  }

  const showEndIndicator = isDropTarget && dropIndicator?.beforeTaskId == null;

  return (
    <div
      className={`flex-none w-72 rounded-xl border-t-4 ${topBorder} bg-white border border-slate-200 shadow-sm flex flex-col gap-2 transition-colors ${
        isDropTarget ? "bg-slate-50" : ""
      }`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <Icon className={`w-4 h-4 ${iconColor} shrink-0`} />
        <span className="font-semibold text-sm text-slate-700 shrink-0">{label}</span>
        <Badge variant="secondary" className="text-xs font-medium shrink-0">
          {tasks.length}
        </Badge>
        <div className="flex items-center gap-0.5 ml-auto">
          {SORT_BUTTONS.map(({ key, label: btnLabel }) => {
            const isActive = sortState.key === key;
            const SortIcon = isActive ? (sortState.asc ? ArrowUp : ArrowDown) : ArrowUpDown;
            return (
              <Button
                key={key}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => onSort(key)}
                className={`h-7 px-2 text-xs gap-1 ${isActive ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "text-slate-500"}`}
              >
                <SortIcon className="w-3 h-3" />
                {btnLabel}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Task list */}
      <div className="flex flex-col px-3">
        {tasks.map((task) => {
          const showAbove = isDropTarget && dropIndicator?.beforeTaskId === task.id;
          return (
            <div key={task.id}>
              {showAbove && <DropLine />}
              <div className="mb-2">
                <TaskCard
                  task={task}
                  isDragging={task.id === draggingId}
                  onClick={() => onTaskClick(task)}
                  onDelete={() => onTaskDelete(task.id)}
                  onStatusChange={(nextStatus) => onTaskStatusChange(task.id, nextStatus)}
                  onTitleChange={(title) => onTaskTitleChange(task.id, title)}
                  onDragStart={() => onDragStart(task.id)}
                  onDragEnd={onDragEnd}
                  onDragOver={(above) => onDragOverCard(task.id, status, above)}
                />
              </div>
            </div>
          );
        })}
        {showEndIndicator && <DropLine />}
      </div>

      {onAddTask && (
        <div className="px-3 pb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddTask}
            className="w-full justify-start gap-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 h-8"
          >
            <Plus className="w-3.5 h-3.5" />
            タスクを追加
          </Button>
        </div>
      )}
    </div>
  );
}

function DropLine() {
  return <div className="h-0.5 bg-indigo-400 rounded-full mx-1 mb-2 shadow-sm" />;
}
