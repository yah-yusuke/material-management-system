import { useState, useEffect } from 'react';

function PushNotifications() {
  const [permission, setPermission] = useState('default');
  const [subscription, setSubscription] = useState(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    checkSupport();
    checkPermission();
    checkSubscription();
  }, []);

  const checkSupport = () => {
    const isSupported = 'Notification' in window &&
                       'serviceWorker' in navigator &&
                       'PushManager' in window;
    setSupported(isSupported);
  };

  const checkPermission = () => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  };

  const checkSubscription = async () => {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
    } catch (error) {
      console.error('サブスクリプション確認エラー:', error);
    }
  };

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        console.log('通知権限が許可されました');
        await subscribeToPush();
      }
    } catch (error) {
      console.error('通知権限リクエストエラー:', error);
    }
  };

  const subscribeToPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;

      // VAPID公開鍵（実際のアプリでは環境変数から取得）
      // 注: 実際に使用する場合は、サーバー側でVAPIDキーを生成し、ここに設定する必要があります
      const vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY_HERE';

      // デモ用のダミーキー（実際の本番環境では使用しない）
      const applicationServerKey = urlBase64ToUint8Array(
        vapidPublicKey === 'YOUR_VAPID_PUBLIC_KEY_HERE'
          ? 'BEl62iUYgUivxIkv69yViEuiBIa-Ib37J8mqFxCVvDgx1SJYvzP6HGD6XJK1JGxXPM3qFkYw3KM0JpRlQ-8w' // ダミー
          : vapidPublicKey
      );

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });

      setSubscription(sub);
      console.log('プッシュ通知サブスクリプション成功:', sub);

      // サーバーにサブスクリプション情報を送信（実際のアプリでは必須）
      // await sendSubscriptionToServer(sub);
    } catch (error) {
      console.error('プッシュ通知サブスクリプションエラー:', error);
    }
  };

  const unsubscribeFromPush = async () => {
    if (!subscription) return;

    try {
      await subscription.unsubscribe();
      setSubscription(null);
      console.log('プッシュ通知サブスクリプション解除');

      // サーバーからサブスクリプション情報を削除（実際のアプリでは必須）
      // await removeSubscriptionFromServer(subscription);
    } catch (error) {
      console.error('サブスクリプション解除エラー:', error);
    }
  };

  const sendTestNotification = async () => {
    if (permission !== 'granted') {
      alert('通知権限が許可されていません');
      return;
    }

    // サービスワーカー経由で通知を表示
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      registration.showNotification('材料在庫管理システム', {
        body: 'これはテスト通知です',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [200, 100, 200],
        tag: 'test-notification',
        requireInteraction: false,
        actions: [
          { action: 'open', title: '開く' },
          { action: 'close', title: '閉じる' }
        ]
      });
    }
  };

  // アラート通知を送信（在庫切れ、最小在庫など）
  const sendInventoryAlert = (materialName, alertType, quantity = 0) => {
    if (permission !== 'granted') return;

    let title = '在庫アラート';
    let body = '';
    let icon = '/icon-192.png';

    switch (alertType) {
      case 'out_of_stock':
        title = '⚠️ 在庫切れ';
        body = `${materialName}の在庫がなくなりました`;
        break;
      case 'low_stock':
        title = '⚠️ 在庫少量';
        body = `${materialName}の在庫が少なくなりました（残り${quantity}）`;
        break;
      case 'reorder_point':
        title = '📦 発注推奨';
        body = `${materialName}が発注点に達しました`;
        break;
      case 'expiry_warning':
        title = '⏰ 有効期限警告';
        body = `${materialName}の有効期限が近づいています`;
        break;
      default:
        body = `${materialName}に関する通知`;
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, {
          body: body,
          icon: icon,
          badge: icon,
          vibrate: [200, 100, 200, 100, 200],
          tag: `inventory-alert-${Date.now()}`,
          requireInteraction: true,
          actions: [
            { action: 'view', title: '確認' },
            { action: 'dismiss', title: '却下' }
          ]
        });
      });
    }
  };

  // Base64 URLエンコードされた文字列をUint8Arrayに変換
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  if (!supported) {
    return (
      <div className="push-notifications">
        <div className="notification-warning">
          <p>❌ このブラウザはプッシュ通知に対応していません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="push-notifications">
      <div className="notification-header">
        <h3>🔔 プッシュ通知</h3>
        <div className={`permission-badge ${permission}`}>
          {permission === 'granted' ? '✅ 有効' :
           permission === 'denied' ? '❌ 拒否' : '⏸️ 未設定'}
        </div>
      </div>

      <div className="notification-content">
        <p className="description">
          在庫アラートや重要な通知をリアルタイムで受け取れます
        </p>

        <div className="notification-actions">
          {permission === 'default' && (
            <button className="btn btn-primary" onClick={requestPermission}>
              🔔 通知を有効にする
            </button>
          )}

          {permission === 'granted' && !subscription && (
            <button className="btn btn-primary" onClick={subscribeToPush}>
              📬 プッシュ通知を購読
            </button>
          )}

          {permission === 'granted' && subscription && (
            <>
              <button className="btn btn-success" onClick={sendTestNotification}>
                🔔 テスト通知を送信
              </button>
              <button className="btn btn-secondary" onClick={unsubscribeFromPush}>
                📭 購読解除
              </button>
            </>
          )}

          {permission === 'denied' && (
            <div className="denied-message">
              <p>通知がブロックされています。ブラウザの設定から許可してください。</p>
              <details>
                <summary>設定方法</summary>
                <ul>
                  <li><strong>Chrome:</strong> 設定 → プライバシーとセキュリティ → サイトの設定 → 通知</li>
                  <li><strong>Firefox:</strong> 設定 → プライバシーとセキュリティ → 許可設定 → 通知</li>
                  <li><strong>Safari:</strong> 設定 → Webサイト → 通知</li>
                </ul>
              </details>
            </div>
          )}
        </div>

        {subscription && (
          <div className="subscription-info">
            <p className="info-label">購読状態:</p>
            <p className="info-value">✅ アクティブ</p>
          </div>
        )}
      </div>

      <div className="notification-features">
        <h4>通知される内容:</h4>
        <ul>
          <li>⚠️ 在庫切れアラート</li>
          <li>📉 最小在庫量到達</li>
          <li>📦 発注推奨通知</li>
          <li>⏰ 有効期限警告</li>
          <li>📊 重要なシステム通知</li>
        </ul>
      </div>

      <style jsx>{`
        .push-notifications {
          background: white;
          border-radius: 15px;
          padding: 20px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          margin-bottom: 20px;
        }

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #e2e8f0;
        }

        .notification-header h3 {
          margin: 0;
          color: #2d3748;
          font-size: 1.5em;
        }

        .permission-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.9em;
          font-weight: 600;
        }

        .permission-badge.granted {
          background: #d1fae5;
          color: #065f46;
        }

        .permission-badge.denied {
          background: #fee2e2;
          color: #991b1b;
        }

        .permission-badge.default {
          background: #e2e8f0;
          color: #475569;
        }

        .notification-content {
          margin-bottom: 20px;
        }

        .description {
          color: #64748b;
          margin-bottom: 15px;
        }

        .notification-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 15px;
        }

        .notification-warning,
        .denied-message {
          padding: 15px;
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          border-radius: 8px;
          margin: 15px 0;
        }

        .denied-message p {
          margin: 0 0 10px 0;
          color: #92400e;
        }

        .denied-message details {
          margin-top: 10px;
        }

        .denied-message summary {
          cursor: pointer;
          font-weight: 600;
          color: #92400e;
        }

        .denied-message ul {
          margin: 10px 0 0 20px;
          color: #92400e;
        }

        .subscription-info {
          padding: 12px;
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          border-radius: 8px;
        }

        .info-label {
          font-size: 0.9em;
          color: #065f46;
          margin: 0 0 5px 0;
          font-weight: 600;
        }

        .info-value {
          margin: 0;
          color: #047857;
          font-size: 1.1em;
          font-weight: 700;
        }

        .notification-features {
          background: #f8fafc;
          padding: 15px;
          border-radius: 10px;
          margin-top: 20px;
        }

        .notification-features h4 {
          margin: 0 0 10px 0;
          color: #2d3748;
          font-size: 1.1em;
        }

        .notification-features ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .notification-features li {
          padding: 8px 0;
          color: #475569;
          border-bottom: 1px solid #e2e8f0;
        }

        .notification-features li:last-child {
          border-bottom: none;
        }

        @media (max-width: 768px) {
          .notification-header {
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
          }

          .notification-actions {
            flex-direction: column;
          }

          .notification-actions button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

// エクスポート用のユーティリティ関数
export const sendInventoryNotification = async (materialName, alertType, quantity = 0) => {
  if (Notification.permission !== 'granted') {
    console.log('通知権限がありません');
    return;
  }

  let title = '在庫アラート';
  let body = '';

  switch (alertType) {
    case 'out_of_stock':
      title = '⚠️ 在庫切れ';
      body = `${materialName}の在庫がなくなりました`;
      break;
    case 'low_stock':
      title = '⚠️ 在庫少量';
      body = `${materialName}の在庫が少なくなりました（残り${quantity}）`;
      break;
    case 'reorder_point':
      title = '📦 発注推奨';
      body = `${materialName}が発注点に達しました`;
      break;
    case 'expiry_warning':
      title = '⏰ 有効期限警告';
      body = `${materialName}の有効期限が近づいています`;
      break;
    default:
      body = `${materialName}に関する通知`;
  }

  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    registration.showNotification(title, {
      body: body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200, 100, 200],
      tag: `inventory-alert-${Date.now()}`,
      requireInteraction: true
    });
  }
};

export default PushNotifications;
