# 発注・仕入統合管理システム

Excelファイルから発注チェックリストと仕入チェックリストを読み込み、統合管理するWebアプリケーションです。

## 機能

- 📄 発注チェックリスト（Excel）の読み込み
- 📋 仕入チェックリスト（Excel）の読み込み
- 🔄 データの自動統合
- 🔍 検索・フィルタ機能
- 📊 統計情報の表示
- 📱 レスポンシブデザイン

## 使用方法

1. [GitHub Pages デモ](https://[username].github.io/material-management-system/)にアクセス
2. 「サンプルデータで動作確認」でテスト
3. または発注・仕入チェックリストのExcelファイルをアップロード

## セットアップ

```bash
git clone https://github.com/[username]/material-management-system.git
cd material-management-system
# Webサーバーで index.html を開く
```

## 技術仕様

- 純粋なHTML/CSS/JavaScript
- Excel読み込みライブラリ: [SheetJS](https://sheetjs.com/)
- 外部依存なし（CDN経由でライブラリ使用）