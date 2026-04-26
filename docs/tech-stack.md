# 技術スタック

## 構成概要

フロントエンド / バックエンドAPI / データベース の3層構成。

```
[ ブラウザ ]
    ↓ HTTP (REST API / JSON)
[ Spring Boot (Java) ]
    ↓ JPA / Hibernate
[ PostgreSQL ]
```

---

## 技術選定

| レイヤー | 技術 | バージョン目安 | 備考 |
|---|---|---|---|
| フロントエンド | React | 18.x | Next.js は対象外 |
| フロントエンド言語 | TypeScript | 5.x | |
| フロントエンド ビルドツール | Vite | 5.x | 高速な開発サーバー・バンドラー |
| スタイリング | Tailwind CSS | 3.x | |
| バックエンド言語 | Java | 25 (LTS) | |
| バックエンドフレームワーク | Spring Boot | 4.0.x | REST API サーバー |
| ORM | Spring Data JPA / Hibernate | Spring Boot 同梱 | |
| データベース | PostgreSQL | 16.x | |
| ビルドツール (BE) | Gradle | 9.x | |
| APIクライアント (FE) | Axios または fetch API | — | バックエンドとの通信 |
| スタイリング | Tailwind CSS | 3.x | |
| 実行環境 | ローカル開発環境 | — | |

---

## 選定理由

| 技術 | 理由 |
|---|---|
| Java + Spring Boot | 企業で広く使われるスタンダードな選択。REST API の構築が容易 |
| React | コンポーネントベースで学習資料が豊富。Next.js なしでも SPA 開発が可能 |
| TypeScript | 型安全なコードで開発体験とバグ検出を向上 |
| Vite | Create React App より高速なHMR・ビルド。現在の標準的なフロントエンド開発ツール |
| Tailwind CSS | ユーティリティクラスで素早くスタイリング可能。Vite + React との相性が良い |
| PostgreSQL | 信頼性が高くSpring Data JPAとの相性が良い。本番環境でも広く利用される |
| Spring Data JPA | Spring Boot と統合されておりエンティティ定義とリポジトリパターンが使いやすい |
| Gradle | ビルド設定が簡潔に書けて Spring Initializr でもデフォルト推奨 |

---

## 動作環境

| 項目 | 内容 |
|---|---|
| 実行環境 | ローカル開発環境 |
| 対応ブラウザ | Chrome / Safari / Firefox 最新版 |
| 対応デバイス | デスクトップのみ |

---

## ディレクトリ構成（想定）

```
TaskManagement/
├── backend/          # Spring Boot プロジェクト
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       └── resources/
│   └── build.gradle
└── frontend/         # React (Vite) プロジェクト
    ├── src/
    └── package.json
```
