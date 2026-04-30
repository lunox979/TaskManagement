import { useEffect, useRef, useState } from "react";
import type { Task, TaskPriority, TaskStatus, TaskUpdateRequest } from "../types/task";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";

interface Props {
  task: Task;
  onClose: () => void;
  onSave: (id: number, request: TaskUpdateRequest) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function TaskDetailModal({ task, onClose, onSave, onDelete }: Props) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority | "">(task.priority ?? "");
  const [dueDate, setDueDate] = useState(task.dueDate ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  async function handleSave() {
    if (!title.trim()) {
      setError("タイトルは必須です");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(task.id, {
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority: priority || null,
        dueDate: dueDate || null,
      });
      onClose();
    } catch {
      setError("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteConfirm() {
    setDeleting(true);
    setError(null);
    try {
      await onDelete(task.id);
      onClose();
    } catch {
      setError("削除に失敗しました");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA" && !saving && !showDeleteConfirm) {
      e.preventDefault();
      handleSave();
    }
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col overflow-hidden" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>タスクを編集</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 flex flex-col gap-4 pr-1">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="detail-title">
              タイトル <span className="text-red-500">*</span>
            </Label>
            <Input
              id="detail-title"
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="タスクのタイトル"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="detail-description">説明</Label>
            <Textarea
              id="detail-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="説明を入力（任意）"
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>ステータス</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">未着手</SelectItem>
                  <SelectItem value="in_progress">進行中</SelectItem>
                  <SelectItem value="done">完了</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>優先度</Label>
              <Select value={priority || "none"} onValueChange={(v) => setPriority(v === "none" ? "" : v as TaskPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">なし</SelectItem>
                  <SelectItem value="low">低</SelectItem>
                  <SelectItem value="medium">中</SelectItem>
                  <SelectItem value="high">高</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="detail-due">期日</Label>
            <Input
              id="detail-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <Separator />

          {/* 削除確認 */}
          {showDeleteConfirm ? (
            <div className="flex items-center justify-between bg-red-50 rounded-lg px-3 py-2.5">
              <p className="text-sm text-red-700 font-medium">本当に削除しますか？</p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                >
                  キャンセル
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                >
                  {deleting ? "削除中..." : "削除"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <p className="text-xs text-slate-400 flex gap-4">
                <span>作成: {new Date(task.createdAt).toLocaleDateString("ja-JP")}</span>
                <span>更新: {new Date(task.updatedAt).toLocaleDateString("ja-JP")}</span>
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="mt-2 flex items-center justify-between w-full sm:justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleting || showDeleteConfirm}
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            削除
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "保存中..." : "保存"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
