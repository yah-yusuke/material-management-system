# 物品管理システム

Excelファイルからの発注・仕入管理と、QRコードを使った在庫管理を統合したWebアプリケーションです。

## アプリケーション

### 1. 📦 QRコード在庫管理（iPhone対応）

**ファイル**: `inventory-qr.html`

iPhoneのカメラで2次元コード（QRコード・バーコード）を読み取り、社内の呼び名で在庫を管理できるPWAアプリです。

#### 主な機能
- 📷 **カメラスキャン**: iPhoneカメラでQRコード/バーコードを読み取り
- 🏷️ **社内呼び名登録**: スキャンしたコードに独自の商品名を設定
- 📊 **在庫管理**: 在庫数の増減を簡単に記録
- 🔍 **検索機能**: 商品名やコードで素早く検索
- 📈 **統計表示**: 商品種類数と総在庫数を一目で確認
- 💾 **データエクスポート**: CSV形式でデータをダウンロード
- 📱 **オフライン対応**: PWA対応でホーム画面に追加して使用可能
- 🎨 **iPhone最適化UI**: タッチ操作に最適化されたデザイン

#### 使い方

**重要**: カメラを使用するにはHTTPS接続が必須です。

##### GitHub Pagesで公開（推奨）
1. GitHubリポジトリの `Settings` > `Pages` を開く
2. Source で `Branch` を選択（main または claude/qr-inventory-app-spsRg）
3. `Save` をクリック
4. 発行されたURLにアクセス（例：`https://username.github.io/material-management-system/inventory-qr.html`）

##### アプリの使用手順
1. `inventory-qr.html` を開く（HTTPS環境で）
2. 「スキャン開始」ボタンをタップしてカメラを起動
3. QRコード/バーコードをスキャン
4. 社内呼び名と在庫数を入力して保存
5. 「在庫一覧」タブで管理・編集
6. 「統計」タブで集計情報を確認

#### データ保存
- ブラウザのLocalStorageに保存
- デバイス内に安全に保管
- CSVエクスポートでバックアップ可能

### 2. 📋 発注・仕入統合管理システム

**ファイル**: `index.html`

Excelファイルから発注チェックリストと仕入チェックリストを読み込み、統合管理するWebアプリケーションです。

#### 主な機能
- 📄 発注チェックリスト（Excel）の読み込み
- 📋 仕入チェックリスト（Excel）の読み込み
- 🔄 データの自動統合
- 🔍 検索・フィルタ機能
- 📊 統計情報の表示
- 📱 レスポンシブデザイン

## セットアップ

### 方法1: GitHub Pagesで公開（最も簡単）

1. このリポジトリをフォークまたはクローン
2. GitHubリポジトリの `Settings` > `Pages` を開く
3. Source で `Branch` を選択（main）
4. `Save` をクリック
5. 数分後にURLが発行されます（例：`https://username.github.io/material-management-system/`）

### 方法2: ローカルで実行

```bash
git clone https://github.com/[username]/material-management-system.git
cd material-management-system

# Pythonで簡易サーバーを起動
python3 -m http.server 8000

# ブラウザで http://localhost:8000/inventory-qr.html を開く
```

**注意**: カメラ機能はHTTPSが必要です。ローカルHTTPサーバーでは動作しないため、ngrokなどのトンネリングサービスを使用するか、GitHub Pagesを利用してください。

### 方法3: ngrokでHTTPSトンネル

```bash
# ローカルサーバーを起動
python3 -m http.server 8000

# 別のターミナルでngrokを起動
ngrok http 8000

# 表示されたHTTPS URLにアクセス
```

## 技術仕様

### QRコード在庫管理
- 純粋なHTML/CSS/JavaScript（依存なし）
- QRコードスキャナー: [html5-qrcode](https://github.com/mebjas/html5-qrcode)
- データ保存: LocalStorage
- PWA対応（Service Worker使用）

### 発注・仕入管理
- 純粋なHTML/CSS/JavaScript
- Excel読み込みライブラリ: [SheetJS](https://sheetjs.com/)
- 外部依存なし（CDN経由でライブラリ使用）