# 🚀 高度な機能ガイド

## 実装された拡張機能

このガイドでは、新たに追加された高度な機能の使い方を説明します。

### ✅ 実装済み機能一覧

1. **複数バーコード一括スキャン** (`BulkBarcodeScanner.jsx`)
2. **スキャン履歴** (`ScanHistory.jsx`)
3. **バックグラウンド同期** (`backgroundSync.js` + `SyncStatus.jsx`)
4. **プッシュ通知** (`PushNotifications.jsx`)
5. **バイブレーションフィードバック** (BulkBarcodeScanner内)

---

## 1. 複数バーコード一括スキャン

### 📋 機能概要

- 連続して複数のバーコード/QRコードをスキャン
- 重複検出と数量カウント
- バイブレーションとビープ音でフィードバック
- スキャン済みアイテムの一覧表示と管理

### 使い方

```javascript
import BulkBarcodeScanner from './components/BulkBarcodeScanner';

function App() {
  const [showBulkScanner, setShowBulkScanner] = useState(false);

  const handleBulkScanComplete = (scannedItems) => {
    console.log('スキャン完了:', scannedItems);
    // scannedItems = [
    //   { code: 'MAT001', count: 3, firstScanned: '2025-...' },
    //   { code: 'MAT002', count: 1, firstScanned: '2025-...' }
    // ]

    // 材料の入庫処理などに使用
    scannedItems.forEach(item => {
      processInbound(item.code, item.count);
    });
  };

  return (
    <>
      <button onClick={() => setShowBulkScanner(true)}>
        📦 一括スキャン
      </button>

      {showBulkScanner && (
        <BulkBarcodeScanner
          onComplete={handleBulkScanComplete}
          onClose={() => setShowBulkScanner(false)}
          mode="unique" // 'continuous' または 'unique'
        />
      )}
    </>
  );
}
```

### モード

- **continuous**: すべてのスキャンを記録（重複も別々に記録）
- **unique**: 重複を統合して数量をカウント（デフォルト）

---

## 2. スキャン履歴

### 📋 機能概要

- 過去のスキャン履歴を保存・表示
- 時間フィルタ（すべて/今日/過去7日間）
- コード検索
- CSV出力
- 履歴からのコード再利用

### 使い方

```javascript
import ScanHistory, { addScanToHistory } from './components/ScanHistory';

function App() {
  const handleSelectFromHistory = (code) => {
    console.log('履歴から選択:', code);
    // 材料フォームなどに自動入力
    setMaterialCode(code);
  };

  // スキャン成功時に履歴に追加
  const handleScan = (code) => {
    addScanToHistory(code, 'barcode'); // type: 'manual', 'barcode', 'qr'
    // ... 他の処理
  };

  return (
    <>
      <ScanHistory onSelectCode={handleSelectFromHistory} />
    </>
  );
}
```

### 履歴データ構造

```javascript
{
  id: 1678901234567,
  code: 'MAT001',
  type: 'barcode', // 'manual', 'barcode', 'qr'
  timestamp: '2025-11-13T10:30:00.000Z'
}
```

---

## 3. バックグラウンド同期

### 📋 機能概要

- オフライン時のトランザクションをキューに保存
- オンライン復帰時に自動同期
- 同期状態の可視化
- 失敗時の再試行

### 使い方

```javascript
import { addToSyncQueue, processSyncQueue } from './utils/backgroundSync';
import SyncStatus from './components/SyncStatus';

function App() {
  // オフライン時の入庫処理
  const handleInbound = async (materialId, quantity) => {
    const data = {
      materialId: materialId,
      quantity: quantity,
      transactionDate: new Date().toISOString()
    };

    if (!navigator.onLine) {
      // オフライン時はキューに追加
      addToSyncQueue('inbound', data);
      alert('オフラインです。オンライン復帰時に自動同期します。');
    } else {
      // オンライン時は直接送信
      try {
        await fetch('/api/transactions/inbound', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      } catch (error) {
        // エラー時もキューに追加
        addToSyncQueue('inbound', data);
      }
    }
  };

  return (
    <>
      {/* 同期状態を表示 */}
      <SyncStatus />

      {/* アプリのコンテンツ */}
    </>
  );
}
```

### 対応するトランザクションタイプ

- `inbound`: 入庫
- `outbound`: 出庫
- `material`: 材料マスタ
- `inventory`: 在庫調整

### API

```javascript
// キューに追加
addToSyncQueue(type, data);

// キューを取得
const queue = getSyncQueue();

// 同期実行
const result = await processSyncQueue('http://localhost:3000/api');

// 統計取得
const stats = getSyncQueueStats();
// => { total: 5, pending: 3, syncing: 1, synced: 0, failed: 1 }

// 失敗アイテムを再試行
await retryFailedItems('http://localhost:3000/api');
```

---

## 4. プッシュ通知

### 📋 機能概要

- 在庫アラートのプッシュ通知
- バックグラウンドでも通知受信
- 通知のカスタマイズ
- 通知権限管理

### 使い方

```javascript
import PushNotifications, { sendInventoryNotification } from './components/PushNotifications';

function App() {
  // 在庫アラートを送信
  const checkInventoryAlerts = async () => {
    const lowStockMaterials = materials.filter(m => m.quantity < m.minQuantity);

    for (const material of lowStockMaterials) {
      await sendInventoryNotification(
        material.name,
        'low_stock',
        material.quantity
      );
    }
  };

  return (
    <>
      <PushNotifications />
    </>
  );
}
```

### 通知タイプ

- `out_of_stock`: 在庫切れ
- `low_stock`: 在庫少量
- `reorder_point`: 発注推奨
- `expiry_warning`: 有効期限警告

### 通知の例

```javascript
// 在庫切れ通知
await sendInventoryNotification('ボルトM6', 'out_of_stock');

// 在庫少量通知
await sendInventoryNotification('ナットM6', 'low_stock', 5);

// 発注推奨通知
await sendInventoryNotification('ワッシャー', 'reorder_point');

// 有効期限警告
await sendInventoryNotification('接着剤A', 'expiry_warning');
```

---

## 5. バイブレーションフィードバック

### 📋 機能概要

BulkBarcodeScannerに統合されたバイブレーション機能

- スキャン成功時に短いバイブレーション
- ビープ音も同時に再生

### 実装詳細

```javascript
// バイブレーション
if ('vibrate' in navigator) {
  navigator.vibrate(50); // 50ms
}

// ビープ音（Web Audio API）
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const oscillator = audioContext.createOscillator();
oscillator.frequency.value = 800; // 800Hz
oscillator.type = 'sine';
oscillator.connect(audioContext.destination);
oscillator.start(audioContext.currentTime);
oscillator.stop(audioContext.currentTime + 0.1); // 0.1秒
```

---

## 統合例: App.jsxへの組み込み

```javascript
import { useState, useEffect } from 'react';
import BarcodeScanner from './components/BarcodeScanner';
import BulkBarcodeScanner from './components/BulkBarcodeScanner';
import ScanHistory, { addScanToHistory } from './components/ScanHistory';
import QRCodeGenerator from './components/QRCodeGenerator';
import SyncStatus from './components/SyncStatus';
import PushNotifications, { sendInventoryNotification } from './components/PushNotifications';
import { addToSyncQueue, monitorOnlineStatus } from './utils/backgroundSync';

function App() {
  const [activeTab, setActiveTab] = useState('materials');
  const [showScanner, setShowScanner] = useState(false);
  const [showBulkScanner, setShowBulkScanner] = useState(false);

  // オンライン/オフライン監視
  useEffect(() => {
    const cleanup = monitorOnlineStatus(
      () => console.log('オンラインに復帰しました'),
      () => console.log('オフラインになりました')
    );
    return cleanup;
  }, []);

  // スキャン処理
  const handleScan = (code) => {
    addScanToHistory(code, 'barcode');
    const material = materials.find(m => m.code === code);
    if (material) {
      setSelectedMaterial(material);

      // 在庫チェック
      if (material.quantity <= material.minQuantity) {
        sendInventoryNotification(material.name, 'low_stock', material.quantity);
      }
    }
    setShowScanner(false);
  };

  // 一括スキャン完了
  const handleBulkScanComplete = (scannedItems) => {
    console.log('一括スキャン完了:', scannedItems);

    // 各アイテムを処理
    scannedItems.forEach(item => {
      const data = {
        materialCode: item.code,
        quantity: item.count,
        timestamp: item.firstScanned
      };

      // オフライン時はキューに追加
      if (!navigator.onLine) {
        addToSyncQueue('inbound', data);
      } else {
        // オンライン時は直接送信
        processInbound(data);
      }
    });

    setShowBulkScanner(false);
  };

  return (
    <div className="app">
      {/* 同期状態表示 */}
      <SyncStatus />

      {/* プッシュ通知設定 */}
      {activeTab === 'settings' && <PushNotifications />}

      {/* スキャン履歴 */}
      {activeTab === 'history' && (
        <ScanHistory onSelectCode={(code) => {
          setActiveTab('materials');
          setMaterialCode(code);
        }} />
      )}

      {/* ボタン群 */}
      <div className="scan-buttons">
        <button className="btn" onClick={() => setShowScanner(true)}>
          📷 スキャン
        </button>
        <button className="btn" onClick={() => setShowBulkScanner(true)}>
          📦 一括スキャン
        </button>
      </div>

      {/* スキャナーモーダル */}
      {showScanner && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      {showBulkScanner && (
        <BulkBarcodeScanner
          onComplete={handleBulkScanComplete}
          onClose={() => setShowBulkScanner(false)}
          mode="unique"
        />
      )}

      {/* メインコンテンツ */}
      {/* ... */}
    </div>
  );
}

export default App;
```

---

## ブラウザ対応

| 機能 | Chrome | Safari | Firefox | Edge |
|------|--------|--------|---------|------|
| 一括スキャン | ✅ | ✅ | ✅ | ✅ |
| スキャン履歴 | ✅ | ✅ | ✅ | ✅ |
| Background Sync | ✅ | ❌ | ❌ | ✅ |
| プッシュ通知 | ✅ | ✅* | ✅ | ✅ |
| バイブレーション | ✅ | ❌ | ✅ | ✅ |

*iOS Safari: PWAとしてインストール後のみ対応

---

## トラブルシューティング

### Background Syncが動作しない

1. HTTPS接続を確認（localhostは除く）
2. Service Workerが正しく登録されているか確認
3. ブラウザがBackground Sync APIに対応しているか確認
4. オフライン時にキューにデータが追加されているか確認

```javascript
// デバッグ用
import { getSyncQueue } from './utils/backgroundSync';
console.log('Sync queue:', getSyncQueue());
```

### プッシュ通知が届かない

1. 通知権限が許可されているか確認
2. Service Workerが登録されているか確認
3. VAPIDキーが正しく設定されているか確認（本番環境）
4. HTTPSが必須（localhostは除く）

### バイブレーションが動作しない

- iOSは非対応（仕様）
- Androidでも一部の古いブラウザは非対応
- ブラウザのバイブレーション権限を確認

---

## セキュリティとプライバシー

### LocalStorage

- スキャン履歴は最大100件まで保存
- 機密情報は暗号化を推奨（将来実装）

### Push Notifications

- 通知内容に機密情報を含めない
- VAPIDキーは環境変数で管理
- サーバー側で通知の送信権限を適切に管理

### Background Sync

- 認証トークンの有効期限を確認
- 同期失敗時の再試行回数を制限
- キューに保存するデータを最小限に

---

## パフォーマンス最適化

1. **スキャン履歴**: 100件を超えたら古いものから削除
2. **同期キュー**: 同期成功後は1秒後に削除
3. **通知**: 同じ材料の通知は一定時間内に1回のみ
4. **バイブレーション**: 短い間隔（50ms）で電力消費を抑制

---

## 今後の拡張予定

- [ ] OCR機能（文字認識）
- [ ] 音声入力
- [ ] AR表示（カメラ越しに在庫情報を表示）
- [ ] Bluetooth連携（外部スキャナー対応）
- [ ] データ暗号化
- [ ] マルチデバイス同期
