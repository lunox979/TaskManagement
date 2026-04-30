import { useRef, useState } from "react";
import type { Task, TaskPriority, TaskStatus } from "../types/task";

const PRIORITY_MAP: Record<TaskPriority, { label: string; className: string }> = {
  high:   { label: "高", className: "text-red-600 bg-red-100" },
  medium: { label: "中", className: "text-amber-600 bg-amber-100" },
  low:    { label: "低", className: "text-blue-600 bg-blue-100" },
};

const STATUS_ACTION: Record<TaskStatus, { label: string; nextStatus: TaskStatus; className: string }> = {
  todo:        { label: "▶ 開始する",   nextStatus: "in_progress", className: "text-blue-600 hover:bg-blue-50" },
  in_progress: { label: "✓ 完了にする", nextStatus: "done",        className: "text-green-600 hover:bg-green-50" },
  done:        { label: "↩ 戻す",       nextStatus: "todo",        className: "text-gray-500 hover:bg-gray-100" },
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
  onStatusChange: (nextStatus: TaskStatus) => void;
  onTitleChange: (title: string) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: (above: boolean) => void;
}

export default function TaskCard({
  task,
  isDragging,
  onClick,
  onDelete,
  onStatusChange,
  onTitleChange,
  onDragStart,
  onDragEnd,
  onDragOver,
}: Props) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const priority = task.priority ? PRIORITY_MAP[task.priority] : null;
  const hasMeta = priority !== null || task.dueDate !== null;
  const action = STATUS_ACTION[task.status];

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    onDragOver(e.clientY < midY);
  }

  function startEditing(e: React.MouseEvent) {
    e.stopPropagation();
    setEditTitle(task.title);
    setIsEditingTitle(true);
    // フォーカスは次の描画後にセット
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function commitEdit() {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== task.title) {
      onTitleChange(trimmed);
    }
    setIsEditingTitle(false);
  }

  function cancelEdit() {
    setIsEditingTitle(false);
  }

  function handleTitleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      commitEdit();
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  }

  return (
    <div
      draggable={!isEditingTitle}
      onClick={isEditingTitle ? undefined : onClick}
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
      {/* ゴミ箱ボタン */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="absolute top-1.5 right-1.5 p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
        tabIndex={-1}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </button>

      {/* タイトル（ダブルクリックでインライン編集） */}
      {isEditingTitle ? (
        <input
          ref={inputRef}
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleTitleKeyDown}
          onClick={(e) => e.stopPropagation()}
          className="w-full text-sm font-medium text-gray-800 leading-snug pr-5 border-b border-blue-400 outline-none bg-transparent"
        />
      ) : (
        <p
          className="text-sm font-medium text-gray-800 leading-snug pr-5"
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={startEditing}
        >
          {task.title}
        </p>
      )}

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

      {/* コンテキスト対応ステータスアクションボタン */}
      <button
        onClick={(e) => { e.stopPropagation(); onStatusChange(action.nextStatus); }}
        className={`mt-2 text-xs font-medium px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-all ${action.className}`}
        tabIndex={-1}
      >
        {action.label}
      </button>
    </div>
  );
}
