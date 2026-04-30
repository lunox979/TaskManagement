import { LayoutDashboard, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onAddTask: () => void;
}

export default function Header({ onAddTask }: Props) {
  return (
    <header className="bg-slate-900 h-14 flex items-center px-6 shadow-lg flex-shrink-0 border-b border-slate-700">
      <div className="flex items-center gap-2.5 flex-1">
        <LayoutDashboard className="text-indigo-400 w-5 h-5" />
        <h1 className="text-white text-lg font-semibold tracking-tight">TaskManagement</h1>
      </div>
      <Button size="sm" onClick={onAddTask} className="gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white">
        <Plus className="w-4 h-4" />
        新規タスク
      </Button>
    </header>
  );
}
