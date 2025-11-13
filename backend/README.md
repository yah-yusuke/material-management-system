# 材料在庫管理システム - バックエンドAPI

SQLiteデータベースを使用した、RESTful APIバックエンドサーバーです。

## 🚀 機能

### ✅ 実装済み機能

#### 📊 データベース機能
- SQLiteデータベース
- 包括的なスキーマ設計
- トランザクション管理
- 外部キー制約

#### 🔐 認証機能
- ユーザー登録・ログイン
- JWT認証
- パスワードハッシュ化（bcrypt）

#### 📦 材料管理API
- 材料CRUD操作
- カテゴリー管理
- 仕入先紐付け
- バーコード対応

#### 📋 在庫管理API
- 在庫照会
- 在庫調整
- リアルタイム在庫数更新
- 予約数量管理

#### 📥📤 入出庫管理API
- 入庫登録（ロットNO、仕入先記録）
- 出庫登録（使用先、工番記録）
- 在庫自動更新
- トランザクション履歴

#### 🛒 発注管理API
- 発注作成・管理
- 発注明細管理
- 仕入先管理
- 納期管理

#### 🔔 アラート機能
- 在庫切れアラート
- 在庫僅少アラート
- 発注点アラート
- 自動アラート生成

#### 📊 高度なレポート機能
- **ABC分析**: 使用金額ベースの材料分類
- **在庫回転率**: 回転率と在庫日数計算
- **発注推奨リスト**: 優先度付き自動発注提案
- **ダッシュボード統計**: リアルタイム統計情報

#### 📝 監査ログ
- 全操作の記録
- ユーザー追跡
- 変更履歴管理

## 📁 ディレクトリ構造

```
backend/
├── src/
│   ├── routes/          # APIルート
│   │   ├── auth.js              # 認証API
│   │   ├── materials.js         # 材料マスタAPI
│   │   ├── inventory.js         # 在庫管理API
│   │   ├── transactions.js      # 入出庫API
│   │   ├── suppliers.js         # 仕入先API
│   │   ├── purchaseOrders.js    # 発注管理API
│   │   ├── alerts.js            # アラートAPI
│   │   └── reports.js           # レポートAPI
│   ├── utils/
│   │   ├── database.js          # DB接続
│   │   └── initDatabase.js      # DB初期化
│   └── server.js        # メインサーバー
├── data/                # SQLiteデータベース
├── package.json
└── README.md
```

## 🛠 セットアップ

### 前提条件
- Node.js 18以上

### インストール

```bash
cd backend
npm install
```

### データベース初期化

```bash
npm run init-db
```

サンプルデータが自動的に作成されます：
- 仕入先3件
- 材料5件
- 初期在庫データ

### 環境変数設定

`.env.example`をコピーして`.env`を作成：

```bash
cp .env.example .env
```

### サーバー起動

#### 開発モード（ホットリロード）
```bash
npm run dev
```

#### 本番モード
```bash
npm start
```

サーバーは `http://localhost:3000` で起動します。

## 📡 API エンドポイント

### 認証
- `POST /api/auth/register` - ユーザー登録
- `POST /api/auth/login` - ログイン

### 材料マスタ
- `GET /api/materials` - 材料一覧取得
- `GET /api/materials/:id` - 材料詳細取得
- `POST /api/materials` - 材料登録
- `PUT /api/materials/:id` - 材料更新
- `DELETE /api/materials/:id` - 材料削除
- `GET /api/materials/meta/categories` - カテゴリー一覧

### 在庫管理
- `GET /api/inventory` - 在庫一覧取得
- `POST /api/inventory/adjust` - 在庫調整

### 入出庫管理
- `GET /api/transactions` - トランザクション履歴
- `POST /api/transactions/receive` - 入庫登録
- `POST /api/transactions/ship` - 出庫登録

### 仕入先
- `GET /api/suppliers` - 仕入先一覧
- `POST /api/suppliers` - 仕入先登録

### 発注管理
- `GET /api/purchase-orders` - 発注一覧
- `POST /api/purchase-orders` - 発注作成

### アラート
- `GET /api/alerts` - アラート一覧
- `PUT /api/alerts/:id/read` - アラート既読

### レポート
- `GET /api/reports/abc-analysis` - ABC分析
- `GET /api/reports/turnover-rate` - 在庫回転率
- `GET /api/reports/reorder-suggestions` - 発注推奨リスト
- `GET /api/reports/dashboard` - ダッシュボード統計

### ヘルスチェック
- `GET /health` - サーバー稼働確認

## 📊 データベーススキーマ

### 主要テーブル
- **users** - ユーザー情報
- **materials** - 材料マスタ
- **inventory** - 在庫データ
- **transactions** - 入出庫トランザクション
- **suppliers** - 仕入先マスタ
- **purchase_orders** - 発注データ
- **purchase_order_items** - 発注明細
- **alerts** - アラート
- **audit_logs** - 監査ログ

## 🔧 技術スタック

- **Node.js** - ランタイム
- **Express** - Webフレームワーク
- **better-sqlite3** - SQLiteドライバー
- **bcryptjs** - パスワードハッシュ化
- **jsonwebtoken** - JWT認証
- **helmet** - セキュリティヘッダー
- **cors** - CORS対応
- **compression** - レスポンス圧縮

## 🔒 セキュリティ

- パスワードのbcryptハッシュ化
- JWT認証トークン
- Helmetによるセキュリティヘッダー
- SQLインジェクション対策（prepared statements）
- CORS設定

## 📈 拡張機能の実装例

### ABC分析
使用金額に基づいて材料をA/B/Cクラスに分類：
- **Aクラス**: 累積70%まで（重点管理）
- **Bクラス**: 累積70-90%（通常管理）
- **Cクラス**: 累積90-100%（簡易管理）

### 在庫回転率
期間内の出庫数量 ÷ 平均在庫数量

### 発注推奨
- 在庫切れ：最優先
- 最低在庫数以下：高優先度
- 発注点以下：中優先度
- 推奨発注数量を自動計算

## 🚀 本番環境デプロイ

### 推奨事項
- `JWT_SECRET`を強力なランダム文字列に変更
- HTTPSを使用
- データベースの定期バックアップ
- ログの適切な管理
- レート制限の実装

## 📝 ライセンス

MIT
