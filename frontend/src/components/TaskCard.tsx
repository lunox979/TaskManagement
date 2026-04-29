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
  isDragging: boolean;
  onClick: () => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: (above: boolean) => void;
}

export default function TaskCard({
  task,
  isDragging,
  onClick,
  onDelete,
  onDragStart,
  onDragEnd,
  onDragOver,
}: Props) {
  const priority = task.priority ? PRIORITY_MAP[task.priority] : null;
  const hasMeta = priority !== null || task.dueDate !== null;

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    onDragOver(e.clientY < midY);
  }

  return (
    <div
      draggable
      onClick={onClick}
      onDragStart={(e) => {
        e.stopPropagation();
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onDragOver={handleDragOver}
      className={`group relative bg-white rounded-md shadow-sm p-3 cursor-pointer select-none transition-opacity hover:shadow-md ${
        isDragging ? "opacity-40" : "opacity-100"
      }`}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="absolute top-1.5 right-1.5 p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
        tabIndex={-1}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </button>
      <p className="text-sm font-medium text-gray-800 leading-snug pr-5">{task.title}</p>
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
