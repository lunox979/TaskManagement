import { useEffect, useState } from "react";
import type { Task } from "./types/task";
import { fetchAllTasks } from "./api/taskApi";
import Header from "./components/Header";
import KanbanBoard from "./components/KanbanBoard";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllTasks()
      .then(setTasks)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      {loading && (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          読み込み中...
        </div>
      )}
      {error && (
        <div className="flex-1 flex items-center justify-center text-red-500">
          エラー: {error}
        </div>
      )}
      {!loading && !error && <KanbanBoard tasks={tasks} />}
    </div>
  );
}
