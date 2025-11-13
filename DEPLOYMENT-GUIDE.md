# 🚀 デプロイメントガイド

## モバイルからアクセスするための手順

### ステップ1: GitHub Pagesを有効化

1. **GitHubリポジトリにアクセス**
   ```
   https://github.com/yah-yusuke/material-management-system
   ```

2. **Settings タブをクリック**

3. **左サイドバーから「Pages」を選択**

4. **Source設定を変更**
   - Source: `GitHub Actions` を選択
   - （または Build and deployment → Source → GitHub Actions）

5. **保存して数分待つ**
   - GitHub Actionsが自動的にビルド＆デプロイを開始します
   - 進行状況は「Actions」タブで確認できます

### ステップ2: デプロイ完了を確認

1. **Actionsタブを開く**
   ```
   https://github.com/yah-yusuke/material-management-system/actions
   ```

2. **最新のワークフロー実行を確認**
   - ✅ 緑のチェックマーク = デプロイ成功
   - 🔴 赤の×マーク = エラー発生

3. **公開URLを確認**
   - Settings → Pages に戻る
   - "Your site is live at" の下にURLが表示されます
   ```
   https://yah-yusuke.github.io/material-management-system/
   ```

### ステップ3: モバイルでアクセス

#### 🌐 ブラウザでアクセス

スマホ・タブレットのブラウザで以下のURLを開く:
```
https://yah-yusuke.github.io/material-management-system/
```

#### 📱 PWAとしてインストール（推奨）

**Android (Chrome):**
1. 上記URLにアクセス
2. 画面下部の「ホーム画面に追加」バナーをタップ
3. または メニュー (⋮) → 「アプリをインストール」
4. 「インストール」をタップ

**iPhone / iPad (Safari):**
1. 上記URLにアクセス
2. 画面下部の共有ボタン □↑ をタップ
3. 「ホーム画面に追加」をタップ
4. 「追加」をタップ

## 📋 デプロイの仕組み

### 自動デプロイ

GitHub Actionsが以下を自動実行します:

1. **トリガー**
   - `claude/material-inventory-system-011CV4xZEDE28eQ59E7fj93K` ブランチへのプッシュ
   - または手動実行

2. **ビルドプロセス**
   ```bash
   cd react-inventory
   npm ci
   npm run build
   ```

3. **デプロイ**
   - `dist/` フォルダの内容をGitHub Pagesに公開

### 手動デプロイ（オプション）

必要に応じて手動でデプロイを実行できます:

1. **Actionsタブを開く**
2. **「Deploy to GitHub Pages」ワークフローを選択**
3. **「Run workflow」をクリック**
4. **ブランチを選択して「Run workflow」**

## 🔧 トラブルシューティング

### デプロイが失敗する場合

#### エラー: "Process completed with exit code 1"

**原因**: ビルドエラー

**解決方法**:
```bash
cd react-inventory
npm install
npm run build
```

ローカルでビルドが成功することを確認してからプッシュ

#### エラー: "Resource not accessible by integration"

**原因**: GitHub Actionsの権限不足

**解決方法**:
1. Settings → Actions → General
2. "Workflow permissions" を "Read and write permissions" に変更
3. 保存してワークフローを再実行

#### エラー: "Page build failed"

**原因**: GitHub Pagesの設定ミス

**解決方法**:
1. Settings → Pages
2. Source が "GitHub Actions" になっているか確認
3. 別のオプションが選択されている場合は変更

### アクセスできない場合

#### 404 Not Found

**原因1**: デプロイがまだ完了していない
- 解決: 5-10分待ってから再度アクセス

**原因2**: URLが間違っている
- 解決: 正しいURL `https://yah-yusuke.github.io/material-management-system/` を使用

**原因3**: リポジトリがプライベート
- 解決: Settings → 一般 で Visibility を Public に変更

#### カメラが動作しない

**原因**: HTTPS接続ではない、または権限がない

**解決方法**:
1. `https://` で始まるURLか確認（GitHub Pagesは自動的にHTTPS）
2. ブラウザの権限設定でカメラを許可
3. 端末のプライバシー設定でブラウザのカメラアクセスを許可

### プッシュ通知が動作しない

**原因**: Service Workerまたは通知権限の問題

**解決方法**:
1. ブラウザの通知権限を確認
2. PWAとしてインストール
3. アプリ内の設定で通知を有効化
4. テスト通知を送信して確認

## 🔄 更新方法

コードを更新したら、以下の手順で自動的に再デプロイされます:

1. **コードを編集**
2. **コミット**
   ```bash
   git add .
   git commit -m "更新内容の説明"
   ```
3. **プッシュ**
   ```bash
   git push
   ```
4. **自動デプロイ開始**
   - GitHub Actionsが自動的に実行
   - 数分でサイトが更新されます

## 📊 デプロイ状況の確認

### GitHub Actions ダッシュボード

```
https://github.com/yah-yusuke/material-management-system/actions
```

- ✅ 緑 = 成功
- 🟡 黄色 = 実行中
- 🔴 赤 = 失敗

### ログの確認

1. Actionsタブで該当のワークフローをクリック
2. 各ジョブ（build、deploy）をクリック
3. 詳細なログを確認

## 🌐 カスタムドメイン（オプション）

独自ドメインを使用したい場合:

1. **ドメインを取得**（お名前.com、ムームードメインなど）

2. **DNS設定**
   ```
   A レコード: 185.199.108.153
   A レコード: 185.199.109.153
   A レコード: 185.199.110.153
   A レコード: 185.199.111.153
   ```

3. **GitHub設定**
   - Settings → Pages
   - Custom domain に取得したドメインを入力
   - Save

4. **HTTPS強制**
   - "Enforce HTTPS" をチェック

## 🎯 本番環境のベストプラクティス

### パフォーマンス

- ✅ ビルド済みファイルのみをデプロイ
- ✅ Gzip圧縮が自動適用
- ✅ CDN配信で高速化

### セキュリティ

- ✅ HTTPS強制（GitHub Pages標準）
- ✅ ソースコードと分離（dist/のみ公開）
- ✅ 環境変数の適切な管理

### メンテナンス

- ✅ 自動デプロイでヒューマンエラー削減
- ✅ バージョン管理で履歴追跡
- ✅ ロールバックが容易

## 📞 サポート

問題が解決しない場合は、以下の情報を含めて報告してください:

- ブラウザとバージョン
- 端末の種類
- エラーメッセージ
- 実行したステップ
- スクリーンショット

---

## 🎉 デプロイ完了後

デプロイが完了したら、以下をテストしてください:

- [ ] URLにアクセスできる
- [ ] PWAとしてインストールできる
- [ ] カメラでバーコードスキャンできる
- [ ] オフラインで動作する
- [ ] プッシュ通知が受信できる
- [ ] データが保存される

すべて問題なければ、本番環境として使用開始できます！🚀
