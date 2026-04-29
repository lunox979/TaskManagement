# quality-check

このプロジェクトの全体的な品質チェックを実行し、問題を報告する。

## チェック手順

### 1. フロントエンド：ESLint（静的解析）

```bash
cd frontend && npm run lint
```

エラーがあれば報告し、自動修正できるものは `--fix` で修正する。

### 2. フロントエンド：TypeScript 型チェック + ビルド確認

```bash
cd frontend && npm run build
```

型エラーやビルドエラーがあれば報告する。

### 3. バックエンド：Checkstyle（静的解析）

```bash
cd backend && ./gradlew checkstyleMain checkstyleTest
```

違反があれば以下のカテゴリで分類して報告・修正する：
- `FileTabCharacter`：タブ→スペース変換
- `AvoidStarImport`：ワイルドカードインポートを個別インポートに展開
- `LeftCurly` / `RightCurly`：波括弧の位置を Java 標準に修正
- `NeedBraces`：if/for/while に波括弧を付与
- `UnusedImports` / `RedundantImport`：不要なインポートを削除
- `ModifierOrder`：修飾子の順序を Java 標準順に修正

### 4. ドキュメントとの差異チェック

以下のドキュメントを読み、実装との差異を確認する：

- `docs/functional-requirements.md`：機能要件
- `docs/screen-design.md`：画面設計（モーダルタイトル、ボタンテキスト、表示要件）
- `docs/database-design.md`：DB スキーマと Entity の整合性

主な確認ポイント：
- モーダルのタイトル文言がドキュメントと一致しているか
- ボタンのテキストがドキュメントと一致しているか
- 全カラムに追加ボタンがあるか（各カラムの status が初期値になっているか）
- 削除確認ダイアログが存在するか
- DB カラムと Entity フィールドのマッピングが正しいか

### 5. バックエンドコード品質チェック

以下を目視確認する：

- Service で `findAll()` など全件取得を避けているか（集計は `@Query` で行う）
- `existsById` + `deleteById` の二重クエリを使っていないか（`findById → delete` が正）
- バリデーション付き DTO には Controller で `@Valid` が付いているか
- `application.properties` と `application.yml` に重複設定がないか
- `@Transactional(readOnly = true)` がクラスレベルに付いているか（書き込みメソッドは `@Transactional` で上書き）

## 完了条件

- `npm run lint`：エラー 0 件
- `npm run build`：成功
- `./gradlew checkstyleMain checkstyleTest`：BUILD SUCCESSFUL
- ドキュメントとの差異：なし（または差異がある場合は修正済み）
