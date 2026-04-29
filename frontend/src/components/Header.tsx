interface Props {
  onCreateTask?: () => void;
}

export default function Header({ onCreateTask }: Props) {
  return (
    <header className="bg-[#1e2a3a] h-14 flex items-center justify-between px-6 shadow-md flex-shrink-0">
      <h1 className="text-white text-xl font-bold tracking-wide">TaskManagement</h1>
      {onCreateTask && (
        <button
          onClick={onCreateTask}
          className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-400 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
        >
          <span className="text-lg leading-none">＋</span>
          新規作成
        </button>
      )}
    </header>
  );
}
