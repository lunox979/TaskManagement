---
description: バックエンド(8080)とフロントエンド(5173)をポート競合解消してから起動する
---

# サーバー起動（ポート競合自動解消）

TaskManagement の全サーバーを正しいポートで起動する。
**別ポートでの代替起動は禁止。必ず指定ポートで起動すること。**

## 手順

### 1. ポート解放（競合があれば停止）

```bash
# バックエンド用ポート解放
PID_8080=$(lsof -ti:8080)
if [ -n "$PID_8080" ]; then
  echo "ポート8080を使用中のプロセス(PID: $PID_8080)を停止します"
  kill -9 $PID_8080
  sleep 1
fi

# フロントエンド用ポート解放
PID_5173=$(lsof -ti:5173)
if [ -n "$PID_5173" ]; then
  echo "ポート5173を使用中のプロセス(PID: $PID_5173)を停止します"
  kill -9 $PID_5173
  sleep 1
fi
```

### 2. DB起動確認

```bash
docker compose up -d
```

### 3. バックエンド起動（ポート8080）

```bash
cd backend && ./gradlew bootRun &
```

起動確認: `curl -s http://localhost:8080/api/ping` が `{"status":"ok"}` を返すまで待つ。

### 4. フロントエンド起動（ポート5173）

```bash
cd frontend && npm run dev -- --port 5173 &
```

起動確認: `curl -s http://localhost:5173` が HTML を返すこと。

### 5. 動作確認

```bash
curl -s http://localhost:5173/api/tasks | head -c 100
```

タスクのJSONが返れば正常起動。
