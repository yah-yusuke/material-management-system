# 🔌 統合サンプルコード

すべてのコンポーネントをApp.jsxに統合するサンプルコードです。

## App.jsx 統合例

```javascript
import { useState, useEffect } from 'react';
import BarcodeScanner from './components/BarcodeScanner';
import BulkBarcodeScanner from './components/BulkBarcodeScanner';
import ScanHistory, { addScanToHistory } from './components/ScanHistory';
import QRCodeGenerator from './components/QRCodeGenerator';
import SyncStatus from './components/SyncStatus';
import PushNotifications, { sendInventoryNotification } from './components/PushNotifications';
import HelpGuide from './components/HelpGuide';
import { addToSyncQueue, monitorOnlineStatus, processSyncQueue } from './utils/backgroundSync';

function App() {
  // 状態管理
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showScanner, setShowScanner] = useState(false);
  const [showBulkScanner, setShowBulkScanner] = useState(false);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  // オンライン/オフライン監視
  useEffect(() => {
    const cleanup = monitorOnlineStatus(
      async () => {
        console.log('オンラインに復帰しました');
        // 自動同期を実行
        try {
          await processSyncQueue();
        } catch (error) {
          console.error('自動同期エラー:', error);
        }
      },
      () => {
        console.log('オフラインになりました');
      }
    );

    return cleanup;
  }, []);

  // Service Workerメッセージリスナー（同期リクエスト受信）
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', async (event) => {
        if (event.data && event.data.type === 'SYNC_REQUEST') {
          console.log('Service Workerから同期リクエスト受信');
          try {
            await processSyncQueue();
          } catch (error) {
            console.error('同期処理エラー:', error);
          }
        }
      });
    }
  }, []);

  // 在庫アラートチェック（定期実行）
  useEffect(() => {
    const checkAlerts = () => {
      materials.forEach(material => {
        // 在庫切れ
        if (material.quantity === 0) {
          sendInventoryNotification(material.name, 'out_of_stock');
        }
        // 在庫少量
        else if (material.quantity <= material.minQuantity) {
          sendInventoryNotification(material.name, 'low_stock', material.quantity);
        }
        // 発注点
        else if (material.reorderPoint && material.quantity <= material.reorderPoint) {
          sendInventoryNotification(material.name, 'reorder_point');
        }
      });
    };

    // 1時間ごとにチェック
    const interval = setInterval(checkAlerts, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [materials]);

  // 単一スキャン処理
  const handleScan = (code) => {
    console.log('スキャン:', code);
    addScanToHistory(code, 'barcode');

    // 材料を検索
    const material = materials.find(m => m.code === code || m.barcode === code);
    if (material) {
      setSelectedMaterial(material);
      alert(`材料を検出: ${material.name}`);

      // 在庫チェック
      if (material.quantity <= material.minQuantity) {
        sendInventoryNotification(material.name, 'low_stock', material.quantity);
      }
    } else {
      alert('材料が見つかりません: ' + code);
    }

    setShowScanner(false);
  };

  // 一括スキャン完了処理
  const handleBulkScanComplete = async (scannedItems) => {
    console.log('一括スキャン完了:', scannedItems);

    for (const item of scannedItems) {
      const data = {
        materialCode: item.code,
        quantity: item.count,
        transactionType: 'inbound',
        timestamp: item.firstScanned,
        notes: '一括スキャンによる入庫'
      };

      // オンライン/オフライン判定
      if (navigator.onLine) {
        try {
          // オンライン時は直接APIへ送信
          const response = await fetch('http://localhost:3000/api/transactions/inbound', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(data)
          });

          if (!response.ok) {
            throw new Error('API送信エラー');
          }

          console.log(`${item.code}: 送信成功`);
        } catch (error) {
          console.error(`${item.code}: 送信失敗、キューに追加`, error);
          addToSyncQueue('inbound', data);
        }
      } else {
        // オフライン時はキューに追加
        console.log(`${item.code}: オフラインのためキューに追加`);
        addToSyncQueue('inbound', data);
      }
    }

    alert(`${scannedItems.length}件の入庫処理を完了しました`);
    setShowBulkScanner(false);

    // 在庫を再読み込み（オンラインの場合）
    if (navigator.onLine) {
      // fetchMaterials(); // 在庫データの再取得
    }
  };

  // 履歴からコード選択
  const handleSelectFromHistory = (code) => {
    console.log('履歴から選択:', code);
    const material = materials.find(m => m.code === code || m.barcode === code);
    if (material) {
      setSelectedMaterial(material);
      setActiveTab('materials');
    }
  };

  return (
    <div className="app">
      {/* ヘッダー */}
      <header className="app-header">
        <h1>📦 材料在庫管理システム</h1>
        <div className="header-actions">
          <button className="btn-icon" onClick={() => setShowHelp(true)} title="ヘルプ">
            ❓
          </button>
        </div>
      </header>

      {/* 同期ステータス */}
      <SyncStatus />

      {/* メインコンテンツ */}
      <div className="main-content">
        {/* タブナビゲーション */}
        <nav className="tab-nav">
          <button
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 ダッシュボード
          </button>
          <button
            className={activeTab === 'materials' ? 'active' : ''}
            onClick={() => setActiveTab('materials')}
          >
            📦 材料マスタ
          </button>
          <button
            className={activeTab === 'inventory' ? 'active' : ''}
            onClick={() => setActiveTab('inventory')}
          >
            📋 在庫管理
          </button>
          <button
            className={activeTab === 'history' ? 'active' : ''}
            onClick={() => setActiveTab('history')}
          >
            📜 スキャン履歴
          </button>
          <button
            className={activeTab === 'settings' ? 'active' : ''}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ 設定
          </button>
        </nav>

        {/* タブコンテンツ */}
        <div className="tab-content">
          {activeTab === 'dashboard' && (
            <div className="dashboard">
              <h2>ダッシュボード</h2>
              {/* ダッシュボードコンテンツ */}
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="materials">
              <h2>材料マスタ</h2>
              {/* 材料一覧 */}
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="inventory">
              <h2>在庫管理</h2>
              {/* 在庫管理コンテンツ */}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="history">
              <ScanHistory onSelectCode={handleSelectFromHistory} />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings">
              <h2>設定</h2>
              <PushNotifications />
              {/* その他の設定 */}
            </div>
          )}
        </div>
      </div>

      {/* フローティングアクションボタン */}
      <div className="fab-container">
        <button
          className="fab"
          onClick={() => setShowScanner(true)}
          title="スキャン"
        >
          📷
        </button>
        <button
          className="fab"
          onClick={() => setShowBulkScanner(true)}
          title="一括スキャン"
        >
          📦
        </button>
        <button
          className="fab"
          onClick={() => setShowQRGenerator(true)}
          title="QRコード生成"
        >
          🔲
        </button>
      </div>

      {/* モーダル: バーコードスキャナー */}
      {showScanner && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* モーダル: 一括バーコードスキャナー */}
      {showBulkScanner && (
        <BulkBarcodeScanner
          onComplete={handleBulkScanComplete}
          onClose={() => setShowBulkScanner(false)}
          mode="unique"
        />
      )}

      {/* モーダル: QRコード生成器 */}
      {showQRGenerator && selectedMaterial && (
        <QRCodeGenerator
          data={JSON.stringify({
            code: selectedMaterial.code,
            name: selectedMaterial.name,
            barcode: selectedMaterial.barcode
          })}
          filename={`QR_${selectedMaterial.code}`}
          onClose={() => setShowQRGenerator(false)}
        />
      )}

      {/* モーダル: ヘルプガイド */}
      {showHelp && (
        <HelpGuide onClose={() => setShowHelp(false)} />
      )}

      <style jsx>{`
        .app {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .app-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .app-header h1 {
          margin: 0;
          font-size: 1.8em;
        }

        .header-actions {
          display: flex;
          gap: 10px;
        }

        .btn-icon {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          width: 45px;
          height: 45px;
          border-radius: 50%;
          color: white;
          font-size: 1.5em;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-icon:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }

        .main-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
        }

        .tab-nav {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .tab-nav button {
          padding: 12px 24px;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          cursor: pointer;
          font-size: 1em;
          font-weight: 600;
          transition: all 0.3s;
        }

        .tab-nav button:hover {
          border-color: #667eea;
          background: #f8fafc;
        }

        .tab-nav button.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: transparent;
        }

        .tab-content {
          background: white;
          border-radius: 15px;
          padding: 30px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          min-height: 500px;
        }

        .fab-container {
          position: fixed;
          bottom: 30px;
          right: 30px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .fab {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          font-size: 1.8em;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
          transition: all 0.3s;
        }

        .fab:hover {
          transform: scale(1.15);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
        }

        .fab:active {
          transform: scale(1.05);
        }

        @media (max-width: 768px) {
          .app-header h1 {
            font-size: 1.2em;
          }

          .tab-nav {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }

          .tab-nav button {
            white-space: nowrap;
          }

          .tab-content {
            padding: 20px;
          }

          .fab-container {
            bottom: 20px;
            right: 20px;
          }

          .fab {
            width: 50px;
            height: 50px;
            font-size: 1.5em;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
```

## 主な統合ポイント

### 1. ヘルプボタン

```javascript
<button className="btn-icon" onClick={() => setShowHelp(true)} title="ヘルプ">
  ❓
</button>

{showHelp && (
  <HelpGuide onClose={() => setShowHelp(false)} />
)}
```

### 2. スキャン機能

```javascript
// フローティングアクションボタン
<div className="fab-container">
  <button className="fab" onClick={() => setShowScanner(true)}>📷</button>
  <button className="fab" onClick={() => setShowBulkScanner(true)}>📦</button>
</div>
```

### 3. 同期ステータス

```javascript
// ページ上部に表示
<SyncStatus />

// オンライン復帰時の自動同期
useEffect(() => {
  const cleanup = monitorOnlineStatus(
    async () => await processSyncQueue(),
    () => console.log('オフライン')
  );
  return cleanup;
}, []);
```

### 4. プッシュ通知

```javascript
// 設定タブに表示
{activeTab === 'settings' && (
  <PushNotifications />
)}

// 在庫アラートの自動送信
useEffect(() => {
  const checkAlerts = () => {
    materials.forEach(material => {
      if (material.quantity <= material.minQuantity) {
        sendInventoryNotification(material.name, 'low_stock', material.quantity);
      }
    });
  };
  const interval = setInterval(checkAlerts, 60 * 60 * 1000);
  return () => clearInterval(interval);
}, [materials]);
```

### 5. スキャン履歴

```javascript
{activeTab === 'history' && (
  <ScanHistory onSelectCode={handleSelectFromHistory} />
)}
```

## 便利なヘルパー関数

```javascript
// オフライン対応のAPI呼び出し
async function apiCallWithFallback(url, options, syncType, syncData) {
  if (!navigator.onLine) {
    addToSyncQueue(syncType, syncData);
    return { offline: true };
  }

  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error('API Error');
    return await response.json();
  } catch (error) {
    addToSyncQueue(syncType, syncData);
    return { offline: true, error };
  }
}

// 使用例
const result = await apiCallWithFallback(
  'http://localhost:3000/api/transactions/inbound',
  {
    method: 'POST',
    body: JSON.stringify(data)
  },
  'inbound',
  data
);
```

## スタイリング

必要なCSSファイル（App.css）:

```css
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-secondary {
  background: #e2e8f0;
  color: #2d3748;
}

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn:active {
  transform: translateY(0);
}
```

---

これで、すべての新機能がアプリ内で使用できるようになります。
ヘルプガイドはアプリ内で「❓」ボタンをクリックすることでいつでもアクセスできます。
