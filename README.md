# 材料管理システム

[![Deploy to GitHub Pages](https://github.com/yah-yusuke/material-management-system/actions/workflows/deploy.yml/badge.svg)](https://github.com/yah-yusuke/material-management-system/actions/workflows/deploy.yml)

**🌐 公開URL**: https://yah-yusuke.github.io/material-management-system/

材料の発注・仕入管理と在庫管理を統合したWebアプリケーション群です。

## システム一覧

### 1. 📦 発注・仕入統合管理システム (`index.html`)

Excelファイルから発注チェックリストと仕入チェックリストを読み込み、統合管理するWebアプリケーションです。

**機能:**
- 📄 発注チェックリスト（Excel）の読み込み
- 📋 仕入チェックリスト（Excel）の読み込み
- 🔄 データの自動統合
- 🔍 検索・フィルタ機能
- 📊 統計情報の表示
- 📱 レスポンシブデザイン

### 2. 📦 材料在庫管理システム (`inventory.html`)

材料の在庫を一元管理し、入出庫履歴の追跡、在庫推移の分析、アラート通知を行う包括的な在庫管理システムです。

### 3. ⚛️ 材料在庫管理システム - React版 (`react-inventory/`)

上記の在庫管理システムをReactで実装したモダンなSPAバージョンです。同じ機能をReactのコンポーネントベースで提供します。

**🚀 PWA機能:**
- 📱 スマホアプリとしてインストール可能
- 📷 バーコード/QRコードスキャン
- 🔄 オフライン動作とバックグラウンド同期
- 🔔 プッシュ通知（在庫アラート）
- 📦 一括バーコードスキャン
- 📜 スキャン履歴管理
- 📳 バイブレーションフィードバック

### 4. 🔌 バックエンドAPI + データベース (`backend/`)

SQLiteデータベースを使用したRESTful APIサーバー。フロントエンドアプリケーションにデータ永続化と高度な機能を提供します。

**主要機能:**
- 🔐 JWT認証
- 📦 材料マスタ管理API
- 📋 在庫管理API
- 📥📤 入出庫トランザクションAPI
- 🛒 発注管理API
- 🔔 自動アラート生成
- 📊 高度なレポート機能
  - ABC分析（使用金額ベース）
  - 在庫回転率計算
  - 自動発注推奨リスト
- 📝 監査ログ
- 💾 SQLiteデータベース

**主要機能:**

#### 📝 材料マスタ管理
- 材料情報の登録・編集・削除
- 最低在庫数・適正在庫数の設定
- ロケーション管理（倉庫・棚番号）
- 材料の検索・フィルタリング

#### 📥 入庫管理
- 入庫データの登録
- ロットNO・仕入先情報の記録
- 自動在庫数更新

#### 📤 出庫管理
- 出庫データの登録
- 使用先・工番の記録
- 在庫不足チェック
- 自動在庫数更新

#### 📋 在庫照会
- リアルタイム在庫状況の確認
- ロケーション別在庫表示
- 在庫ステータス表示（在庫あり・僅少・切れ）
- 多様な検索・フィルタリング機能

#### 📜 履歴管理
- 全入出庫履歴の記録・表示
- 日付・材料・種別による絞り込み
- 在庫残高の追跡

#### 📊 ダッシュボード
- 在庫統計情報の表示
- 在庫アラートの一覧表示
- 在庫推移グラフ（過去30日）
- 材料別在庫状況グラフ

#### 🔔 在庫アラート機能
- 最低在庫数を下回った場合の警告
- 在庫切れ時の通知
- リアルタイムアラート表示

#### 📈 レポート機能
- 期間指定による在庫分析
- 入出庫統計の集計
- グラフによる可視化

#### 💾 データ永続化
- ローカルストレージによるデータ保存
- ブラウザを閉じてもデータを保持

#### 📤 データエクスポート
- CSV形式でのエクスポート
- Excel形式でのエクスポート
- 在庫一覧・履歴データの出力

## 使用方法

### 発注・仕入統合管理システム
1. `index.html` をブラウザで開く
2. 「サンプルデータで動作確認」でテスト
3. または発注・仕入チェックリストのExcelファイルをアップロード

### 材料在庫管理システム（HTML版）
1. `inventory.html` をブラウザで開く
2. サンプルデータが自動的に読み込まれます
3. タブを切り替えて各機能を利用:
   - **ダッシュボード**: 在庫状況の概要確認
   - **材料マスタ**: 材料情報の登録・管理
   - **入庫管理**: 入庫データの登録
   - **出庫管理**: 出庫データの登録
   - **在庫照会**: 現在の在庫状況確認
   - **履歴**: 入出庫履歴の確認
   - **レポート**: 在庫分析レポートの生成

### 材料在庫管理システム（React版）

#### 📱 モバイル/公開版（推奨）
1. スマホのブラウザで以下のURLにアクセス:
   ```
   https://yah-yusuke.github.io/material-management-system/
   ```
2. PWAとしてインストール:
   - **Android**: 「ホーム画面に追加」をタップ
   - **iOS**: 共有ボタン □↑ → 「ホーム画面に追加」

#### 💻 ローカル開発版
1. プロジェクトディレクトリに移動
   ```bash
   cd react-inventory
   ```
2. 依存関係をインストール
   ```bash
   npm install
   ```
3. 開発サーバーを起動
   ```bash
   npm run dev
   ```
4. ブラウザで `http://localhost:5173` を開く
5. サンプルデータが自動的に読み込まれます

### バックエンドAPI
1. プロジェクトディレクトリに移動
   ```bash
   cd backend
   ```
2. 依存関係をインストール
   ```bash
   npm install
   ```
3. データベースを初期化
   ```bash
   npm run init-db
   ```
4. サーバーを起動
   ```bash
   npm start  # または npm run dev（ホットリロード）
   ```
5. APIサーバーが `http://localhost:3000` で起動

**主要APIエンドポイント:**
- `/api/materials` - 材料マスタ
- `/api/inventory` - 在庫管理
- `/api/transactions` - 入出庫
- `/api/reports/abc-analysis` - ABC分析
- `/api/reports/reorder-suggestions` - 発注推奨

## セットアップ

```bash
git clone https://github.com/[username]/material-management-system.git
cd material-management-system
# index.html または inventory.html をブラウザで開く
```

## 技術仕様

### HTML版（index.html, inventory.html）
- 純粋なHTML/CSS/JavaScript
- Excel読み込み: [SheetJS](https://sheetjs.com/)
- グラフ表示: [Chart.js](https://www.chartjs.org/)
- データ永続化: localStorage API
- 外部依存なし（CDN経由でライブラリ使用）

### React版（react-inventory/）
- フレームワーク: React 18.2
- ビルドツール: Vite 5.0
- グラフライブラリ: Chart.js 4.4 + react-chartjs-2
- Excelライブラリ: SheetJS (xlsx)
- バーコードスキャン: html5-qrcode
- QRコード生成: qrcode
- スタイリング: Vanilla CSS
- データ永続化: localStorage API
- PWA機能: Service Worker, Web App Manifest
- デプロイ: GitHub Pages + GitHub Actions

### バックエンドAPI（backend/）
- ランタイム: Node.js
- フレームワーク: Express
- データベース: SQLite（better-sqlite3）
- 認証: JWT（jsonwebtoken）
- セキュリティ: bcryptjs, helmet, cors
- その他: compression, dotenv

## ブラウザ対応

- Chrome（推奨）
- Firefox
- Safari
- Edge

## 📚 ドキュメント

- [デプロイメントガイド](DEPLOYMENT-GUIDE.md) - GitHub Pagesへのデプロイ方法
- [モバイルアクセスガイド](react-inventory/MOBILE-ACCESS-GUIDE.md) - モバイルからのアクセス方法
- [高度な機能ガイド](react-inventory/ADVANCED-FEATURES-GUIDE.md) - PWA機能の詳細説明
- [統合サンプル](react-inventory/INTEGRATION-EXAMPLE.md) - コンポーネントの統合方法
- [PWAモバイルガイド](react-inventory/PWA-MOBILE-GUIDE.md) - PWA機能の使い方
- [アイコン作成ガイド](react-inventory/CREATE-ICONS.md) - アプリアイコンの作成方法

## 注意事項

- データはブラウザのローカルストレージに保存されます
- ブラウザのキャッシュをクリアするとデータが削除されます
- 重要なデータは定期的にCSV/Excel形式でエクスポートしてください