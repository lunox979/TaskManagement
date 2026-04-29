import { useEffect, useState } from "react";
import type { Task } from "./types/task";
import { fetchAllTasks, createTask } from "./api/taskApi";
import type { CreateTaskRequest } from "./api/taskApi";
import Header from "./components/Header";
import KanbanBoard from "./components/KanbanBoard";
import TaskCreateModal from "./components/TaskCreateModal";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchAllTasks()
      .then(setTasks)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreateTask(request: CreateTaskRequest) {
    const newTask = await createTask(request);
    setTasks((prev) => [...prev, newTask]);
  }

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
      {!loading && !error && (
        <KanbanBoard
          tasks={tasks}
          onTasksChange={setTasks}
          onAddTask={() => setShowCreateModal(true)}
        />
      )}
      {showCreateModal && (
        <TaskCreateModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTask}
        />
      )}
    </div>
  );
}
