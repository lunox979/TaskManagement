import { useRef, useState } from "react";
import type { Task, TaskPriority, TaskStatus } from "../types/task";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Trash2, Play, Check, Undo2 } from "lucide-react";

const PRIORITY_MAP: Record<TaskPriority, { label: string; className: string }> = {
  high:   { label: "高", className: "bg-red-100 text-red-700 hover:bg-red-100" },
  medium: { label: "中", className: "bg-amber-100 text-amber-700 hover:bg-amber-100" },
  low:    { label: "低", className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
};

const STATUS_ACTION: Record<TaskStatus, {
  label: string;
  nextStatus: TaskStatus;
  Icon: React.ElementType;
  className: string;
}> = {
  todo:        { label: "開始する",   nextStatus: "in_progress", Icon: Play,  className: "text-indigo-600 hover:bg-indigo-50" },
  in_progress: { label: "完了にする", nextStatus: "done",        Icon: Check, className: "text-emerald-600 hover:bg-emerald-50" },
  done:        { label: "戻す",       nextStatus: "todo",        Icon: Undo2, className: "text-slate-500 hover:bg-slate-100" },
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
  const ActionIcon = action.Icon;

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
    <Card
      draggable={!isEditingTitle}
      onClick={isEditingTitle ? undefined : onClick}
      onDragStart={(e) => { e.stopPropagation(); onDragStart(); }}
      onDragEnd={onDragEnd}
      onDragOver={handleDragOver}
      className={`group relative cursor-pointer select-none transition-all duration-200 hover:shadow-md border-slate-200 ${
        isDragging ? "opacity-40" : "opacity-100"
      }`}
    >
      <CardContent className="p-3">
        {/* ゴミ箱ボタン */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="absolute top-2 right-2 p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
          tabIndex={-1}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* タイトル */}
        {isEditingTitle ? (
          <input
            ref={inputRef}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleTitleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="w-full text-sm font-medium text-slate-800 leading-snug pr-5 border-b border-indigo-400 outline-none bg-transparent"
          />
        ) : (
          <p
            className="text-sm font-medium text-slate-800 leading-snug pr-5"
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={startEditing}
          >
            {task.title}
          </p>
        )}

        {/* メタ情報 */}
        {hasMeta && (
          <div className="flex items-center gap-2 mt-2">
            {priority && (
              <Badge className={`text-xs font-semibold px-1.5 py-0 h-5 ${priority.className}`}>
                {priority.label}
              </Badge>
            )}
            {task.dueDate && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <CalendarDays className="w-3 h-3" />
                {formatDate(task.dueDate)}
              </span>
            )}
          </div>
        )}

        {/* ステータスアクションボタン */}
        <button
          onClick={(e) => { e.stopPropagation(); onStatusChange(action.nextStatus); }}
          className={`mt-2 flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-all ${action.className}`}
          tabIndex={-1}
        >
          <ActionIcon className="w-3 h-3" />
          {action.label}
        </button>
      </CardContent>
    </Card>
  );
}
