// バックグラウンド同期ユーティリティ
// オフライン時のトランザクションをキューに保存し、オンライン復帰時に自動同期

const SYNC_QUEUE_KEY = 'syncQueue';
const SYNC_TAG = 'inventory-sync';

/**
 * 同期キューにアイテムを追加
 * @param {string} type - トランザクションタイプ ('inbound', 'outbound', 'material')
 * @param {Object} data - 同期するデータ
 */
export const addToSyncQueue = (type, data) => {
  const queue = getSyncQueue();
  const item = {
    id: Date.now(),
    type: type,
    data: data,
    timestamp: new Date().toISOString(),
    status: 'pending'
  };

  queue.push(item);
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));

  // Background Sync APIがサポートされていれば登録
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.sync.register(SYNC_TAG).catch((err) => {
        console.error('Background Sync登録エラー:', err);
      });
    });
  }

  return item.id;
};

/**
 * 同期キューを取得
 * @returns {Array} 同期待ちアイテムの配列
 */
export const getSyncQueue = () => {
  const queue = localStorage.getItem(SYNC_QUEUE_KEY);
  return queue ? JSON.parse(queue) : [];
};

/**
 * 同期キューをクリア
 */
export const clearSyncQueue = () => {
  localStorage.removeItem(SYNC_QUEUE_KEY);
};

/**
 * 特定のアイテムを同期キューから削除
 * @param {number} itemId - 削除するアイテムのID
 */
export const removeFromSyncQueue = (itemId) => {
  const queue = getSyncQueue();
  const updatedQueue = queue.filter(item => item.id !== itemId);
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(updatedQueue));
};

/**
 * 同期キュー内のアイテムのステータスを更新
 * @param {number} itemId - 更新するアイテムのID
 * @param {string} status - 新しいステータス ('pending', 'syncing', 'synced', 'failed')
 */
export const updateSyncItemStatus = (itemId, status) => {
  const queue = getSyncQueue();
  const updatedQueue = queue.map(item =>
    item.id === itemId ? { ...item, status } : item
  );
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(updatedQueue));
};

/**
 * 同期キューを処理してサーバーに送信
 * @param {string} apiBaseUrl - APIのベースURL
 * @returns {Promise<Object>} 同期結果
 */
export const processSyncQueue = async (apiBaseUrl = 'http://localhost:3000/api') => {
  const queue = getSyncQueue();
  const pendingItems = queue.filter(item => item.status === 'pending');

  if (pendingItems.length === 0) {
    return { success: true, synced: 0, failed: 0 };
  }

  const results = {
    success: true,
    synced: 0,
    failed: 0,
    errors: []
  };

  for (const item of pendingItems) {
    updateSyncItemStatus(item.id, 'syncing');

    try {
      let endpoint = '';
      let method = 'POST';

      // トランザクションタイプに応じてエンドポイントを決定
      switch (item.type) {
        case 'inbound':
          endpoint = `${apiBaseUrl}/transactions/inbound`;
          break;
        case 'outbound':
          endpoint = `${apiBaseUrl}/transactions/outbound`;
          break;
        case 'material':
          endpoint = `${apiBaseUrl}/materials`;
          method = item.data.id ? 'PUT' : 'POST';
          if (item.data.id) endpoint += `/${item.data.id}`;
          break;
        case 'inventory':
          endpoint = `${apiBaseUrl}/inventory/${item.data.materialId}`;
          method = 'PATCH';
          break;
        default:
          throw new Error(`Unknown sync type: ${item.type}`);
      }

      // サーバーに送信
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          // 認証トークンがあれば追加
          ...(localStorage.getItem('authToken') && {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          })
        },
        body: JSON.stringify(item.data)
      });

      if (response.ok) {
        updateSyncItemStatus(item.id, 'synced');
        results.synced++;

        // 同期成功したアイテムは削除
        setTimeout(() => removeFromSyncQueue(item.id), 1000);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Sync failed for item ${item.id}:`, error);
      updateSyncItemStatus(item.id, 'failed');
      results.failed++;
      results.errors.push({
        itemId: item.id,
        error: error.message
      });
    }
  }

  results.success = results.failed === 0;
  return results;
};

/**
 * オンライン/オフライン状態を監視
 * @param {Function} onOnline - オンライン復帰時のコールバック
 * @param {Function} onOffline - オフライン時のコールバック
 */
export const monitorOnlineStatus = (onOnline, onOffline) => {
  const handleOnline = () => {
    console.log('オンラインに復帰しました。同期を開始します...');
    if (onOnline) onOnline();
  };

  const handleOffline = () => {
    console.log('オフラインになりました。');
    if (onOffline) onOffline();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // クリーンアップ関数を返す
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

/**
 * 現在のオンライン状態を取得
 * @returns {boolean} オンラインならtrue
 */
export const isOnline = () => {
  return navigator.onLine;
};

/**
 * 同期キューの統計情報を取得
 * @returns {Object} 統計情報
 */
export const getSyncQueueStats = () => {
  const queue = getSyncQueue();
  return {
    total: queue.length,
    pending: queue.filter(item => item.status === 'pending').length,
    syncing: queue.filter(item => item.status === 'syncing').length,
    synced: queue.filter(item => item.status === 'synced').length,
    failed: queue.filter(item => item.status === 'failed').length
  };
};

/**
 * 失敗したアイテムを再試行
 */
export const retryFailedItems = async (apiBaseUrl) => {
  const queue = getSyncQueue();
  const failedItems = queue.filter(item => item.status === 'failed');

  // ステータスをpendingに戻す
  failedItems.forEach(item => {
    updateSyncItemStatus(item.id, 'pending');
  });

  // 同期処理を実行
  return await processSyncQueue(apiBaseUrl);
};
