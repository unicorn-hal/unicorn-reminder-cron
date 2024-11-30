# リマインダー スクリプト - 仕様書

このプロジェクトは、Google Cloud Run Schedulerを使用して定期的に実行されるリマインダー送信サービスです。毎時0分、15分、30分、45分に実行され、ユーザーに対しておくすりリマインダーや定期検診の通知を送信します。

## 実行スケジュール

- **実行時間**: 毎時 0分、15分、30分、45分
- **スケジューラ**: Cloud Run Scheduler

## 機能詳細

### おくすりリマインダーの送信

- 指定時間におくすりの服用を促す通知を該当ユーザーに送信します。
- ユーザーのFCMトークンを取得し、Firebase Cloud Messagingを通じてプッシュ通知を行います。

### 定期検診の通知送信

- 毎日12時に定期検診のリマインダーを全ユーザーに送信します。
- トピック機能を利用し、購読者全員に一斉通知を送信します。

## 環境設定

### 必要な環境変数

- `CRON_EMAIL`: Firebase認証用のメールアドレス
- `CRON_PASSWORD`: Firebase認証用のパスワード
- `CRON_UID`: FirebaseユーザーのUID
- `NOTIFICATION_SERVER_URL`: 通知サーバーのベースURL
- `UNICORN_MONOREPO_URL`: サーバーAPIのベースURL

### 必要なファイル

- `firebaseConfig.json`: Firebaseプロジェクトの設定ファイル

※これらのファイルはセキュリティ上、Gitリポジトリには含めず、個別に配置してください。

## ビルドとデプロイ

### ローカルでのテスト実行

必要に応じて `index.ts` でデバッグ用のDateTimeに調整してから実行をおすすめします。

1. docker-composeを利用して実行

   ```bash
   docker-compose up --build
   ```

### Cloud Runへのデプロイ

1. Dockerイメージをビルドし、コンテナレジストリにプッシュ

   ```bash
   npm run push
   ```

2. Cloud Run上でサービスを作成し、スケジューラを設定

## 使用技術

- **言語**: TypeScript
- **ランタイム**: Node.js v18
- **主要ライブラリ**:
  - Firebase
  - Axios

## 注意事項

- 環境変数や秘密情報は、適切に管理してください。
- Firebase関連の設定や認証情報は、適切な場所に配置してください。

---