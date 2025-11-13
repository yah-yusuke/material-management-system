# 📱 PWA・モバイルアプリ化ガイド

## 🎯 実装済み機能

### ✅ PWA化
- ✅ `manifest.json` - アプリマニフェスト
- ✅ Service Worker - オフライン対応とキャッシング
- ✅ インストール可能なアプリ
- ✅ iOS/Android対応

### ✅ バーコード/QRコードスキャン
- ✅ `BarcodeScanner.jsx` - スキャナーコンポーネント
- ✅ `QRCodeGenerator.jsx` - QRコード生成コンポーネント
- ✅ 対応形式: QRコード、CODE128、CODE39、EAN13、EAN8
- ✅ カメラアクセス

### ✅ モバイル最適化
- ✅ レスポンシブデザイン
- ✅ タッチフレンドリーUI
- ✅ モバイルビューポート設定

## 📲 使い方

### PWAインストール方法

#### Android (Chrome)
1. アプリをブラウザで開く
2. メニュー（⋮）→「ホーム画面に追加」
3. アプリ名を確認して「追加」

#### iOS (Safari)
1. アプリをSafariで開く
2. 共有ボタン（□↑）→「ホーム画面に追加」
3. アプリ名を確認して「追加」

#### PC (Chrome/Edge)
1. アドレスバーの右にインストールアイコン（⊕）をクリック
2. 「インストール」をクリック

### バーコードスキャン機能の使い方

#### 材料マスタでスキャン
1. 「材料マスタ」タブを開く
2. 「📷 バーコードスキャン」ボタンをクリック
3. カメラ権限を許可
4. バーコードをカメラに向ける
5. 自動的にスキャンして材料コード欄に入力

#### 入出庫でスキャン
1. 「入庫管理」または「出庫管理」タブを開く
2. 材料選択の横にある「📷」ボタンをクリック
3. バーコードをスキャン
4. 該当する材料が自動選択

#### QRコード生成
1. 「材料マスタ」で材料を登録
2. 材料コードのQRコードを生成
3. 印刷してラベルとして使用

## 🔧 App.jsxへの統合例

```javascript
import { useState } from 'react';
import BarcodeScanner from './components/BarcodeScanner';
import QRCodeGenerator from './components/QRCodeGenerator';

function App() {
  const [showScanner, setShowScanner] = useState(false);
  const [scannedCode, setScannedCode] = useState('');

  const handleScan = (code) => {
    console.log('スキャン結果:', code);
    setScannedCode(code);
    setShowScanner(false);

    // 材料検索など
    const material = materials.find(m => m.code === code || m.barcode === code);
    if (material) {
      // 材料を選択
      setMaterialForm({ ...materialForm, code: material.code });
    }
  };

  return (
    <>
      {/* スキャンボタン */}
      <button className="btn btn-primary" onClick={() => setShowScanner(true)}>
        📷 バーコードスキャン
      </button>

      {/* スキャナーモーダル */}
      {showScanner && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* QRコード表示 */}
      <QRCodeGenerator data={materialCode} size={150} />
    </>
  );
}
```

## 🎨 アイコン画像の作成

PWAアプリのアイコンを作成してください：

### 必要な画像
1. **icon-192.png** - 192×192px
2. **icon-512.png** - 512×512px

### 作成方法

#### オンラインツール使用
1. [Canva](https://www.canva.com/) または [Figma](https://www.figma.com/)
2. 正方形キャンバス（512×512px）を作成
3. アイコンデザイン:
   - 背景: グラデーション（#667eea → #764ba2）
   - アイコン: 📦 または 在庫管理のシンボル
   - テキスト: 「在庫」または「Inventory」
4. 512×512pxでエクスポート → `icon-512.png`
5. 192×192pxでリサイズ → `icon-192.png`

#### ImageMagickで自動生成（簡易版）
```bash
# 512x512の単色アイコン作成
convert -size 512x512 gradient:"#667eea-#764ba2" icon-512.png

# 192x192にリサイズ
convert icon-512.png -resize 192x192 icon-192.png
```

### 配置場所
```
react-inventory/public/
├── icon-192.png
├── icon-512.png
└── manifest.json
```

## 🚀 ビルドとデプロイ

### ビルド
```bash
cd react-inventory
npm install
npm run build
```

### デプロイ先
- **Netlify**: `dist/`フォルダをドラッグ＆ドロップ
- **Vercel**: GitHubリポジトリと連携
- **GitHub Pages**: `dist/`フォルダを公開

### HTTPS必須
PWA機能（Service Worker、カメラアクセス）にはHTTPSが必要です。
- ローカル開発: `localhost`はHTTP可
- 本番: HTTPS必須

## 📊 オフライン機能

### キャッシュされるもの
- HTMLファイル
- JavaScript/CSSファイル
- 画像（アイコン等）

### localStorageとの併用
- アプリデータは`localStorage`に保存
- オフラインでも入出庫登録可能
- オンライン復帰時に同期（将来実装可能）

## 🔒 カメラ権限

### 初回アクセス時
ブラウザがカメラ権限を要求します：
- **許可**: スキャン機能が使える
- **拒否**: 手動入力のみ

### 権限の再設定
- **Chrome**: 設定 → サイトの設定 → カメラ
- **Safari**: 設定 → Safari → カメラ

## 🌐 ブラウザ対応

| 機能 | Chrome | Safari | Firefox | Edge |
|------|--------|--------|---------|------|
| PWA | ✅ | ✅ | ✅ | ✅ |
| Service Worker | ✅ | ✅ | ✅ | ✅ |
| カメラ | ✅ | ✅ | ✅ | ✅ |
| バーコード | ✅ | ✅ | ✅ | ✅ |
| インストール | ✅ | ✅ (Add to Home) | ❌ | ✅ |

## 💡 Tips

### パフォーマンス最適化
- Service Workerでキャッシュ戦略を調整
- 画像の最適化（WebP形式）
- コード分割（React.lazy）

### UX改善
- スキャン成功時のフィードバック（バイブレーション、音）
- スキャン履歴の保存
- オフライン通知の表示

### セキュリティ
- HTTPS必須
- カメラ権限の適切な処理
- データの暗号化（将来実装）

## 📝 今後の拡張案

- [ ] バイブレーションフィードバック
- [ ] スキャン履歴
- [ ] オフライン同期
- [ ] プッシュ通知
- [ ] バックグラウンド同期
- [ ] 複数バーコード一括スキャン
- [ ] OCR機能（文字認識）

## 🆘 トラブルシューティング

### カメラが起動しない
1. HTTPS接続を確認
2. カメラ権限を確認
3. 他のアプリがカメラを使用していないか確認

### Service Workerが動作しない
1. ブラウザのコンソールでエラー確認
2. キャッシュをクリア
3. Service Workerを再登録

### アイコンが表示されない
1. manifest.jsonのパスを確認
2. 画像ファイルのサイズ・形式を確認
3. ブラウザキャッシュをクリア
