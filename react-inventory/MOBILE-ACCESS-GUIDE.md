# 📱 モバイルアクセスガイド

## 🌐 公開URL

アプリは以下のURLで公開されます（デプロイ後）:

**https://yah-yusuke.github.io/material-management-system/**

## 🚀 デプロイ手順

### 1. gh-pagesパッケージのインストール

```bash
cd react-inventory
npm install --save-dev gh-pages
```

### 2. ビルド＆デプロイ

```bash
npm run deploy
```

このコマンドで以下が自動実行されます:
1. Reactアプリのビルド (`npm run build`)
2. gh-pagesブランチへのデプロイ
3. GitHub Pagesへの公開

### 3. GitHub Pagesの設定確認

1. GitHubリポジトリページを開く: https://github.com/yah-yusuke/material-management-system
2. Settings → Pages
3. Source: `gh-pages` ブランチが選択されているか確認
4. 数分待つと公開完了

## 📱 モバイルでのアクセス方法

### スマホ・タブレットからアクセス

1. **ブラウザでアクセス**
   ```
   https://yah-yusuke.github.io/material-management-system/
   ```

2. **PWAとしてインストール（推奨）**

   #### Android (Chrome)
   1. 上記URLにアクセス
   2. 画面下部の「ホーム画面に追加」をタップ
   3. または、メニュー (⋮) → 「アプリをインストール」
   4. 「インストール」をタップ
   5. ホーム画面にアイコンが追加されます

   #### iPhone / iPad (Safari)
   1. 上記URLにアクセス
   2. 画面下部の共有ボタン <□↑> をタップ
   3. 下にスクロールして「ホーム画面に追加」をタップ
   4. 「追加」をタップ
   5. ホーム画面にアイコンが追加されます

### QRコードでアクセス（オプション）

QRコードを生成すると、スキャンするだけでアクセスできます:

```
https://yah-yusuke.github.io/material-management-system/
```

このURLをQRコード生成ツールで変換してください。

## 🔧 ローカル開発時のモバイルテスト

同じWi-Fiネットワークに接続している場合、ローカル開発サーバーにもアクセスできます:

1. **開発サーバーを起動**
   ```bash
   cd react-inventory
   npm run dev
   ```

2. **PCのIPアドレスを確認**
   ```bash
   # Windows
   ipconfig

   # Mac / Linux
   ifconfig
   # または
   ip addr show
   ```

3. **モバイルからアクセス**
   ```
   http://[PCのIPアドレス]:5173
   # 例: http://192.168.1.10:5173
   ```

   ⚠️ **注意**: カメラ、通知、Service Workerなどの機能はHTTPSが必要です。
   ローカルテストではこれらの機能が制限される場合があります。

## ✨ PWAインストール後のメリット

- ⚡ オフライン動作
- 📡 バックグラウンド同期
- 🔔 プッシュ通知
- 🏠 ホーム画面から即アクセス
- 📱 フルスクリーンで使用可能
- 🚀 ネイティブアプリのような速度

## 🔐 HTTPS必須機能

以下の機能はHTTPS接続が必須です（GitHub Pagesは自動的にHTTPS）:

- ✅ カメラアクセス（バーコード/QRコードスキャン）
- ✅ Service Worker（オフライン機能）
- ✅ プッシュ通知
- ✅ 位置情報（将来実装時）
- ✅ PWAインストール

ローカル開発 (http://localhost:5173) では動作しますが、
ネットワーク経由 (http://192.168.x.x:5173) では制限されます。

## 🌍 対応ブラウザ

### モバイル
- ✅ Chrome for Android (推奨)
- ✅ Safari for iOS (iOS 11.3+)
- ✅ Samsung Internet
- ✅ Firefox for Android
- ✅ Edge for Android

### デスクトップ
- ✅ Chrome / Edge (推奨)
- ✅ Firefox
- ✅ Safari (macOS)
- ⚠️ IE11 (非対応)

## 📊 データ同期

### オンライン時
- サーバーと即座に同期
- リアルタイムでデータ更新

### オフライン時
- ローカルに自動保存
- オンライン復帰時に自動同期

⚠️ **重要**: バックエンドAPIサーバー（localhost:3000）は別途起動が必要です。
本番環境では、APIもデプロイする必要があります。

## 🎯 推奨設定

モバイルで最適に使用するための推奨設定:

1. **PWAとしてインストール**（必須）
2. **プッシュ通知を有効化**
3. **カメラ権限を許可**
4. **バックグラウンド更新を許可**（iOS）
5. **データセーバーをオフ**（Android）

## 🆘 トラブルシューティング

### アクセスできない場合

1. URLのスペルミスを確認
2. GitHub Pagesが公開されているか確認
3. 数分待ってから再度アクセス
4. キャッシュをクリアして再読み込み

### カメラが動作しない場合

1. HTTPS接続を確認
2. ブラウザのカメラ権限を確認
3. 端末のカメラ権限を確認
4. 他のアプリがカメラを使用していないか確認

### インストールボタンが表示されない場合

1. HTTPS接続を確認
2. manifest.jsonが正しく配信されているか確認
3. ブラウザがPWAに対応しているか確認
4. すでにインストール済みでないか確認

---

## 📞 サポート

問題が解決しない場合は、以下の情報を添えてお問い合わせください:

- 使用している端末（iPhone 14、Galaxy S21 など）
- OSバージョン（iOS 16.5、Android 13 など）
- ブラウザとバージョン
- エラーメッセージ（あれば）
- スクリーンショット（可能であれば）
