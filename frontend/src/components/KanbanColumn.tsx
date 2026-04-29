import type { Task, TaskStatus } from "../types/task";
import TaskCard from "./TaskCard";

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
  onAddTask?: () => void;
  onTaskClick: (task: Task) => void;
  onDragStart: (taskId: number) => void;
  onDragEnd: () => void;
  onDragOverColumn: (status: TaskStatus) => void;
  onDragOverCard: (taskId: number, status: TaskStatus, above: boolean) => void;
  onDrop: (status: TaskStatus) => void;
}

export default function KanbanColumn({
  label,
  status,
  tasks,
  draggingId,
  dropIndicator,
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

  const showEndIndicator =
    isDropTarget && dropIndicator?.beforeTaskId == null;

  return (
    <div
      className={`flex-none w-72 rounded-lg p-3 flex flex-col gap-2 transition-colors ${
        isDropTarget ? "bg-[#dfe1e6]" : "bg-[#ebecf0]"
      }`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between px-1 pb-1">
        <span className="font-bold text-sm text-gray-700">{label}</span>
        <span className="bg-[#c2c7d0] text-xs font-bold px-2 py-0.5 rounded-full min-w-[22px] text-center text-gray-600">
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-col">
        {tasks.map((task) => {
          const showAbove =
            isDropTarget && dropIndicator?.beforeTaskId === task.id;

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
  return (
    <div className="h-0.5 bg-blue-400 rounded-full mx-1 mb-2 shadow-sm" />
  );
}
