import type { Task } from "../types/task";
import TaskCard from "./TaskCard";

interface Props {
  label: string;
  tasks: Task[];
}

export default function KanbanColumn({ label, tasks }: Props) {
  return (
    <div className="flex-none w-72 bg-[#ebecf0] rounded-lg p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between px-1 pb-1">
        <span className="font-bold text-sm text-gray-700">{label}</span>
        <span className="bg-[#c2c7d0] text-xs font-bold px-2 py-0.5 rounded-full min-w-[22px] text-center text-gray-600">
          {tasks.length}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
