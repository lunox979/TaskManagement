# TaskManagement

Trello風のカンバンボード型タスク管理Webアプリ。フルスタック開発の学習を目的として作成。

---

## 概要

| 項目 | 内容 |
|------|------|
| アプリ種別 | カンバンボード型タスク管理 SPA |
| 対象ユーザー | 個人利用（シングルユーザー・認証なし） |
| 動作環境 | ローカル開発環境 |
| 対応ブラウザ | Chrome / Safari / Firefox 最新版 |
| 対応デバイス | デスクトップのみ |

---

## 機能一覧

- **カンバンボード** — 未着手 / 進行中 / 完了 の3列固定。各カラムのタスク件数を表示
- **タスクCRUD** — タスクの追加・編集・削除（モーダル形式）
- **ドラッグ&ドロップ** — カラム内の並び替え、カラム間の移動
- **優先度ソート** — カラムヘッダーのボタンで優先度順（高→中→低）に並び替え
- **入力バリデーション** — タイトル必須。フロントエンド・バックエンド双方で検証

### タスク項目

| 項目 | 必須 | 内容 |
|------|:----:|------|
| タイトル | ○ | タスクの名称（最大255文字） |
| 説明文 | — | タスクの詳細説明 |
| 優先度 | — | 高 / 中 / 低 |
| 期限 | — | 日付で指定 |

---

## 技術スタック

### 構成

```
[ ブラウザ (React SPA) ]
    ↓ HTTP / REST API (JSON)
[ Spring Boot (Java 25) ]
    ↓ Spring Data JPA / Hibernate
[ PostgreSQL 17 (Docker) ]
```

### バージョン一覧

| レイヤー | 技術 | バージョン |
|---|---|---|
| フロントエンド | React | 19.2.5 |
| フロントエンド言語 | TypeScript | 6.0.3 |
| ビルドツール (FE) | Vite | 5.4.21 |
| スタイリング | Tailwind CSS | 3.4.19 |
| バックエンド言語 | Java | 25 (LTS) |
| バックエンドフレームワーク | Spring Boot | 4.0.6 |
| ORM | Spring Data JPA / Hibernate | Spring Boot 同梱 |
| データベース | PostgreSQL | 17 |
| ビルドツール (BE) | Gradle | 9.4.1 |
| コンテナ | Docker / Docker Compose | — |

---

## ディレクトリ構成

```
TaskManagement/
├── backend/                    # Spring Boot アプリ
│   ├── src/main/java/          # Javaソースコード
│   ├── src/main/resources/     # application.properties 等
│   └── build.gradle
├── frontend/                   # React (Vite) アプリ
│   ├── src/                    # Reactコンポーネント・ロジック
│   ├── public/
│   └── package.json
├── docs/                       # 設計ドキュメント
├── docker-compose.yml          # PostgreSQL コンテナ定義
└── CLAUDE.md                   # Claude Code 作業ガイドライン
```

---

## セットアップ・起動手順

### 前提条件

- Java 25
- Node.js（LTS）
- Docker / Docker Compose

### 環境変数の設定

プロジェクトルートに `.env` を作成する（`.gitignore` 対象）。

```env
DB_NAME=taskmanagement
DB_USER=your_user
DB_PASSWORD=your_password
```

バックエンドの `src/main/resources/application.properties` にも同様の値を設定する。

### 起動手順

```bash
# 1. ポート解放（競合がある場合）
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# 2. DB（PostgreSQL）起動
docker compose up -d

# 3. バックエンド起動（別ターミナル）
cd backend && ./gradlew bootRun

# 4. フロントエンド起動（別ターミナル）
cd frontend && npm install && npm run dev
```

| サーバー | URL |
|---|---|
| フロントエンド | http://localhost:5173 |
| バックエンドAPI | http://localhost:8080 |

---

## データベース設計

### tasks テーブル

| カラム名 | 型 | 制約 | 説明 |
|---|---|---|---|
| id | INTEGER | PK, AUTO INCREMENT | 一意識別子 |
| title | VARCHAR(255) | NOT NULL | タスクのタイトル |
| description | TEXT | NULL可 | タスクの詳細説明 |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'todo' | `todo` / `in_progress` / `done` |
| priority | VARCHAR(10) | NULL可 | `high` / `mid` / `low` |
| due_date | DATE | NULL可 | 期限日 |
| order_index | INTEGER | NOT NULL | カラム内の表示順（昇順） |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新日時 |

---

## ドキュメント

| ドキュメント | 概要 |
|---|---|
| [要件定義](docs/requirements.md) | プロジェクト概要・制約事項・非機能要件 |
| [機能要件](docs/functional-requirements.md) | カンバンボード・タスク操作・バリデーションの詳細 |
| [画面設計](docs/screen-design.md) | 画面要件・ワイヤーフレーム・画面遷移図 |
| [ユースケース](docs/use-cases.md) | 各操作の詳細フロー |
| [データベース設計](docs/database-design.md) | ER図・テーブル定義 |
| [技術スタック](docs/tech-stack.md) | 技術選定・バージョン・選定理由 |

---

## 開発ガイドライン

Issue ファースト・PR 経由マージを必須とする。詳細は [CLAUDE.md](CLAUDE.md) を参照。
