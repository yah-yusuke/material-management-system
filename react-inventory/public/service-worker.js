const CACHE_NAME = 'material-inventory-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// インストール時
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('キャッシュを開きました');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// アクティベーション時
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('古いキャッシュを削除:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// フェッチ時（ネットワーク優先、フォールバックでキャッシュ）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // レスポンスをクローンしてキャッシュに保存
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        // ネットワークエラー時はキャッシュから返す
        return caches.match(event.request);
      })
  );
});

// バックグラウンド同期
self.addEventListener('sync', (event) => {
  console.log('Background Sync event:', event.tag);

  if (event.tag === 'inventory-sync') {
    event.waitUntil(syncInventoryData());
  }
});

// 同期処理の実装
async function syncInventoryData() {
  try {
    // localStorageから同期キューを取得
    const clients = await self.clients.matchAll();
    if (clients.length === 0) {
      console.log('アクティブなクライアントがありません');
      return;
    }

    // クライアントに同期処理を依頼
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_REQUEST',
        timestamp: new Date().toISOString()
      });
    });

    console.log('同期リクエストを送信しました');
  } catch (error) {
    console.error('同期処理エラー:', error);
    throw error;
  }
}

// プッシュ通知
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);

  const options = {
    body: event.data ? event.data.text() : '新しい通知があります',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'inventory-notification',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification('材料在庫管理システム', options)
  );
});

// 通知クリック時の処理
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // すでに開いているウィンドウがあればフォーカス
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // なければ新しいウィンドウを開く
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});
