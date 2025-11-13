import { useState, useEffect } from 'react';
import {
  getSyncQueueStats,
  processSyncQueue,
  retryFailedItems,
  monitorOnlineStatus,
  isOnline
} from '../utils/backgroundSync';

function SyncStatus() {
  const [stats, setStats] = useState({ total: 0, pending: 0, syncing: 0, synced: 0, failed: 0 });
  const [online, setOnline] = useState(isOnline());
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncResult, setSyncResult] = useState(null);

  useEffect(() => {
    updateStats();

    // オンライン/オフライン監視
    const cleanup = monitorOnlineStatus(
      () => {
        setOnline(true);
        handleAutoSync();
      },
      () => {
        setOnline(false);
      }
    );

    // 定期的に統計を更新
    const interval = setInterval(updateStats, 5000);

    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, []);

  const updateStats = () => {
    const newStats = getSyncQueueStats();
    setStats(newStats);
  };

  const handleAutoSync = async () => {
    if (!online || syncing) return;

    const currentStats = getSyncQueueStats();
    if (currentStats.pending === 0 && currentStats.failed === 0) return;

    setSyncing(true);
    setSyncResult(null);

    try {
      const result = await processSyncQueue();
      setSyncResult(result);
      setLastSyncTime(new Date());
      updateStats();
    } catch (error) {
      console.error('同期エラー:', error);
      setSyncResult({ success: false, error: error.message });
    } finally {
      setSyncing(false);
    }
  };

  const handleManualSync = async () => {
    await handleAutoSync();
  };

  const handleRetryFailed = async () => {
    setSyncing(true);
    setSyncResult(null);

    try {
      const result = await retryFailedItems();
      setSyncResult(result);
      setLastSyncTime(new Date());
      updateStats();
    } catch (error) {
      console.error('再試行エラー:', error);
      setSyncResult({ success: false, error: error.message });
    } finally {
      setSyncing(false);
    }
  };

  // 同期キューが空の場合は表示しない
  if (stats.total === 0) {
    return null;
  }

  return (
    <div className="sync-status">
      <div className="sync-header">
        <div className="sync-title">
          <span className={`status-indicator ${online ? 'online' : 'offline'}`}></span>
          <h4>
            {online ? '🌐 オンライン' : '📡 オフライン'}
          </h4>
        </div>
        <div className="sync-actions">
          {online && (
            <>
              <button
                className="btn btn-sm btn-primary"
                onClick={handleManualSync}
                disabled={syncing || (stats.pending === 0 && stats.failed === 0)}
              >
                {syncing ? '同期中...' : '🔄 同期'}
              </button>
              {stats.failed > 0 && (
                <button
                  className="btn btn-sm btn-warning"
                  onClick={handleRetryFailed}
                  disabled={syncing}
                >
                  🔄 再試行
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {stats.total > 0 && (
        <div className="sync-stats">
          <div className="stat-item">
            <span className="stat-label">待機中</span>
            <span className="stat-value pending">{stats.pending}</span>
          </div>
          {stats.syncing > 0 && (
            <div className="stat-item">
              <span className="stat-label">同期中</span>
              <span className="stat-value syncing">{stats.syncing}</span>
            </div>
          )}
          {stats.failed > 0 && (
            <div className="stat-item">
              <span className="stat-label">失敗</span>
              <span className="stat-value failed">{stats.failed}</span>
            </div>
          )}
          {stats.synced > 0 && (
            <div className="stat-item">
              <span className="stat-label">完了</span>
              <span className="stat-value synced">{stats.synced}</span>
            </div>
          )}
        </div>
      )}

      {syncResult && (
        <div className={`sync-result ${syncResult.success ? 'success' : 'error'}`}>
          {syncResult.success ? (
            <p>✅ {syncResult.synced}件のデータを同期しました</p>
          ) : (
            <p>❌ 同期に失敗しました: {syncResult.error || `${syncResult.failed}件失敗`}</p>
          )}
        </div>
      )}

      {lastSyncTime && (
        <div className="last-sync">
          最終同期: {lastSyncTime.toLocaleString('ja-JP')}
        </div>
      )}

      <style jsx>{`
        .sync-status {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 12px;
          padding: 15px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .sync-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .sync-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sync-title h4 {
          margin: 0;
          font-size: 1.1em;
          color: #2d3748;
        }

        .status-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .status-indicator.online {
          background: #10b981;
        }

        .status-indicator.offline {
          background: #ef4444;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .sync-actions {
          display: flex;
          gap: 8px;
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 0.9em;
        }

        .sync-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 10px;
          margin-bottom: 10px;
        }

        .stat-item {
          text-align: center;
          padding: 10px;
          background: white;
          border-radius: 8px;
        }

        .stat-label {
          display: block;
          font-size: 0.8em;
          color: #64748b;
          margin-bottom: 4px;
        }

        .stat-value {
          display: block;
          font-size: 1.4em;
          font-weight: 700;
        }

        .stat-value.pending {
          color: #f59e0b;
        }

        .stat-value.syncing {
          color: #3b82f6;
        }

        .stat-value.synced {
          color: #10b981;
        }

        .stat-value.failed {
          color: #ef4444;
        }

        .sync-result {
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 10px;
        }

        .sync-result.success {
          background: #d1fae5;
          color: #065f46;
        }

        .sync-result.error {
          background: #fee2e2;
          color: #991b1b;
        }

        .sync-result p {
          margin: 0;
          font-size: 0.9em;
          font-weight: 600;
        }

        .last-sync {
          font-size: 0.85em;
          color: #64748b;
          text-align: center;
        }

        @media (max-width: 768px) {
          .sync-header {
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
          }

          .sync-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}

export default SyncStatus;
