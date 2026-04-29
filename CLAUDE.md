# TaskManagement - Claude Code ガイドライン

## GitHub ワークフロー（厳守ルール）

このプロジェクトでは **Issue ファースト、PR 経由マージ** を必須とする。
Claude Code が開発作業を行う際も、必ずこの順序を守ること。

---

### 1. Issue ファースト原則

**作業開始前に必ず GitHub Issue を作成する。Issue なしでコードを書くことは禁止。**

Issue 作成時の必須項目：
- タイトル：何をするのか端的に（日本語）
- 本文：背景・目的・完了条件
- ラベル：下記ラベル一覧から 1 つ以上選択

---

### 2. ラベル一覧

| ラベル | 用途 |
|--------|------|
| `feature` | 新機能の追加 |
| `bug` | バグ修正 |
| `hotfix` | 本番環境の緊急修正 |
| `docs` | ドキュメント更新 |
| `refactor` | リファクタリング（機能変更なし） |
| `test` | テスト追加・修正 |
| `chore` | ビルド設定・依存関係・CI/CD |
| `infra` | インフラ・Docker・DB 設定 |

---

### 3. ブランチ命名規則

形式: `{type}#{issue-number}-{短い説明（英語・ハイフン区切り）}`

```
feature#12-add-task-priority
fix#34-fix-login-error
hotfix#56-critical-data-loss
docs#7-update-api-docs
refactor#23-extract-task-service
test#45-add-unit-tests-for-auth
chore#8-setup-github-actions
infra#3-setup-docker-compose
```

**ルール：**
- ブランチは必ず Issue 番号を含める
- `main` への直接プッシュは GitHub 側で禁止（ブランチ保護設定済み）
- ブランチは Issue に対して 1 対 1 を基本とする
- ブランチの短い説明は英語・小文字・ハイフン区切り

---

### 4. コミットメッセージ規則

形式: `{type}: {変更内容の要約（日本語）} (#Issue番号)`

```
feat: タスクに優先度フィールドを追加 (#12)
fix: ログイン時のNullPointerExceptionを修正 (#34)
docs: タスクAPI仕様書を更新 (#7)
refactor: TaskServiceからRepository処理を分離 (#23)
test: TaskControllerのユニットテストを追加 (#45)
chore: GitHub Actions CIパイプラインを追加 (#8)
infra: Docker Composeにnginxを追加 (#3)
```

**type 一覧：**

| type | 用途 |
|------|------|
| `feat` | 新機能 |
| `fix` | バグ修正 |
| `docs` | ドキュメント |
| `refactor` | リファクタリング |
| `test` | テスト |
| `chore` | ビルド・CI/CD |
| `infra` | インフラ |

**ルール：**
- 要約は **日本語** で書く
- 末尾に必ず Issue 番号を記載する `(#番号)`
- 命令形・現在形で書く（「追加する」ではなく「追加」）

---

### 5. プルリクエスト（PR）規則

- `main` への直接プッシュは**禁止**（ブランチ保護で強制）
- すべての変更は PR を通じてマージする
- PR タイトルは `{type}: {内容（日本語）} (#Issue番号)` 形式
- PR 本文に必ず `Closes #Issue番号` を記載（マージ時に Issue を自動クローズ）
- セルフマージ可（レビュアー不在の場合）

---

### 6. Claude Code の作業手順

Claude が開発タスクを受けた際は**必ず以下の順序**を守る：

```bash
# 1. Issue を作成
gh issue create --title "タイトル（日本語）" --body "本文" --label "feature"

# 2. Issue 番号を確認してブランチ作成
git checkout -b feature#{number}-{description}

# 3. 実装・コミット（日本語メッセージ、Issue 番号必須）
git commit -m "feat: 実装内容（日本語） (#{number})"

# 4. プッシュ
git push origin feature#{number}-{description}

# 5. PR を作成（Issue を自動クローズ）
gh pr create --title "feat: 実装内容 (#{number})" --body "Closes #{number}"
```

---

## サーバー起動ルール（厳守）

サーバーを起動する前に、**必ず**そのポートで動いているプロセスを停止すること。
別のポートで代替起動することは禁止。アプリが指定するデフォルトポートで動かすこと。

| サーバー | ポート | 停止コマンド |
|---|---|---|
| バックエンド（Spring Boot） | 8080 | `lsof -ti:8080 \| xargs kill -9` |
| フロントエンド（Vite） | 5173 | `lsof -ti:5173 \| xargs kill -9` |
| PostgreSQL（Docker） | 5432 | `docker compose stop db` |

### 起動手順（毎回この順序で実行）

```bash
# 1. ポート解放（競合時は必ず実行）
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# 2. DB起動
docker compose up -d

# 3. バックエンド起動（別ターミナル）
cd backend && ./gradlew bootRun

# 4. フロントエンド起動（別ターミナル）
cd frontend && npm run dev
```

---

## プロジェクト技術スタック

| 層 | 技術 |
|----|------|
| フロントエンド | React + Vite + TypeScript |
| バックエンド | Java 25 + Spring Boot 4.0.6 |
| データベース | PostgreSQL 16 |
| コンテナ | Docker / Docker Compose |
| CI/CD | GitHub Actions（予定） |

## ディレクトリ構成

```
TaskManagement/
├── backend/          # Spring Boot アプリ
├── frontend/         # React + Vite アプリ
├── docs/             # 設計ドキュメント
├── docker-compose.yml
└── CLAUDE.md
```
