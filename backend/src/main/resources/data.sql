INSERT INTO tasks (title, description, status, priority, due_date, order_index, created_at, updated_at)
SELECT * FROM (VALUES
  ('買い物リスト作成', 'スーパーで買うものをまとめる', 'todo', 'low', DATE '2026-05-01', 1, NOW(), NOW()),
  ('週次レポート提出', '先週の進捗をまとめて提出する', 'in_progress', 'high', DATE '2026-04-30', 2, NOW(), NOW()),
  ('コードレビュー', 'PRのコードをレビューする', 'todo', 'medium', DATE '2026-05-02', 3, NOW(), NOW()),
  ('デプロイ作業', '本番環境へのデプロイを実施', 'done', 'high', DATE '2026-04-28', 4, NOW(), NOW()),
  ('ミーティング準備', '週次ミーティングのアジェンダ作成', 'todo', 'medium', DATE '2026-05-03', 5, NOW(), NOW())
) AS v(title, description, status, priority, due_date, order_index, created_at, updated_at)
WHERE NOT EXISTS (SELECT 1 FROM tasks);
