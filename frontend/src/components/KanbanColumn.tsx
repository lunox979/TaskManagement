import type { Task, TaskStatus } from "../types/task";
import type { SortKey } from "./KanbanBoard";
import TaskCard from "./TaskCard";

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
  onDragStart,
  onDragEnd,
  onDragOverColumn,
  onDragOverCard,
  onDrop,
}: Props) {
  const isDropTarget = dropIndicator?.status === status;

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
      className={`flex-none w-72 rounded-lg p-3 flex flex-col gap-2 transition-colors ${
        isDropTarget ? "bg-[#dfe1e6]" : "bg-[#ebecf0]"
      }`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-1 pb-1">
        <span className="font-bold text-sm text-gray-700 shrink-0">{label}</span>
        <span className="bg-[#c2c7d0] text-xs font-bold px-2 py-0.5 rounded-full min-w-[22px] text-center text-gray-600 shrink-0">
          {tasks.length}
        </span>
        <div className="flex items-center gap-1 ml-auto">
          {SORT_BUTTONS.map(({ key, label: btnLabel }) => {
            const isActive = sortState.key === key;
            const arrow = isActive ? (sortState.asc ? "↑" : "↓") : "";
            return (
              <button
                key={key}
                onClick={() => onSort(key)}
                className={`text-xs px-1.5 py-0.5 rounded transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-blue-500 text-white font-semibold"
                    : "bg-[#c2c7d0] text-gray-600 hover:bg-[#b0b5bf]"
                }`}
              >
                {btnLabel}{arrow}
              </button>
            );
          })}
        </div>
      </div>

      {/* Task list */}
      <div className="flex flex-col">
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
        <button
          onClick={onAddTask}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 hover:bg-[#dcdfe4] text-sm px-2 py-1.5 rounded-md transition-colors mt-1"
        >
          <span className="text-base leading-none">＋</span>
          タスクを追加
        </button>
      )}
    </div>
  );
}

function DropLine() {
  return <div className="h-0.5 bg-blue-400 rounded-full mx-1 mb-2 shadow-sm" />;
}
