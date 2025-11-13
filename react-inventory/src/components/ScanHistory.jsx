import { useState, useEffect } from 'react';

function ScanHistory({ onSelectCode }) {
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'today', 'week'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const savedHistory = localStorage.getItem('scanHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  };

  const saveHistory = (newHistory) => {
    localStorage.setItem('scanHistory', JSON.stringify(newHistory));
    setHistory(newHistory);
  };

  const addToHistory = (code, type = 'manual') => {
    const newEntry = {
      id: Date.now(),
      code: code,
      type: type, // 'manual', 'barcode', 'qr'
      timestamp: new Date().toISOString()
    };

    const updatedHistory = [newEntry, ...history].slice(0, 100); // 最新100件のみ保持
    saveHistory(updatedHistory);
  };

  const clearHistory = () => {
    if (confirm('すべてのスキャン履歴を削除しますか？')) {
      saveHistory([]);
    }
  };

  const deleteEntry = (id) => {
    const updatedHistory = history.filter(item => item.id !== id);
    saveHistory(updatedHistory);
  };

  const getFilteredHistory = () => {
    let filtered = history;

    // 期間フィルタ
    const now = new Date();
    if (filter === 'today') {
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      filtered = filtered.filter(item => new Date(item.timestamp) >= todayStart);
    } else if (filter === 'week') {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      filtered = filtered.filter(item => new Date(item.timestamp) >= weekAgo);
    }

    // 検索フィルタ
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const groupByCode = () => {
    const grouped = {};
    history.forEach(item => {
      if (!grouped[item.code]) {
        grouped[item.code] = {
          code: item.code,
          count: 0,
          lastScanned: item.timestamp,
          type: item.type
        };
      }
      grouped[item.code].count++;
      if (new Date(item.timestamp) > new Date(grouped[item.code].lastScanned)) {
        grouped[item.code].lastScanned = item.timestamp;
      }
    });
    return Object.values(grouped).sort((a, b) => b.count - a.count);
  };

  const exportHistory = () => {
    const csv = [
      ['日時', 'コード', 'タイプ'].join(','),
      ...history.map(item => [
        new Date(item.timestamp).toLocaleString('ja-JP'),
        item.code,
        item.type
      ].join(','))
    ].join('\n');

    const bom = '\uFEFF';
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `scan-history-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredHistory = getFilteredHistory();
  const groupedData = groupByCode();

  return (
    <div className="scan-history">
      <div className="history-header">
        <h3>📜 スキャン履歴</h3>
        <div className="history-actions">
          <button className="btn btn-secondary" onClick={exportHistory}>
            📥 CSV出力
          </button>
          <button className="btn btn-danger" onClick={clearHistory}>
            🗑️ クリア
          </button>
        </div>
      </div>

      <div className="history-filters">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            すべて
          </button>
          <button
            className={`filter-btn ${filter === 'today' ? 'active' : ''}`}
            onClick={() => setFilter('today')}
          >
            今日
          </button>
          <button
            className={`filter-btn ${filter === 'week' ? 'active' : ''}`}
            onClick={() => setFilter('week')}
          >
            過去7日間
          </button>
        </div>

        <input
          type="text"
          className="search-input"
          placeholder="コードで検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="history-stats">
        <div className="stat-item">
          <span className="stat-label">総スキャン数</span>
          <span className="stat-value">{history.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">ユニーク数</span>
          <span className="stat-value">{groupedData.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">表示中</span>
          <span className="stat-value">{filteredHistory.length}</span>
        </div>
      </div>

      <div className="history-tabs">
        <button className="tab-btn active">時系列</button>
        <button className="tab-btn">集計</button>
      </div>

      <div className="history-list">
        {filteredHistory.length === 0 ? (
          <div className="empty-state">
            <p>📭 履歴がありません</p>
          </div>
        ) : (
          filteredHistory.map(item => (
            <div key={item.id} className="history-item">
              <div className="item-content">
                <div className="item-code-section">
                  <span className="item-code">{item.code}</span>
                  <span className={`item-type type-${item.type}`}>
                    {item.type === 'barcode' ? '📊' : item.type === 'qr' ? '📱' : '⌨️'}
                  </span>
                </div>
                <div className="item-time">
                  {new Date(item.timestamp).toLocaleString('ja-JP')}
                </div>
              </div>
              <div className="item-actions">
                <button
                  className="btn-use"
                  onClick={() => onSelectCode && onSelectCode(item.code)}
                  title="このコードを使用"
                >
                  使用
                </button>
                <button
                  className="btn-delete"
                  onClick={() => deleteEntry(item.id)}
                  title="削除"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .scan-history {
          background: white;
          border-radius: 15px;
          padding: 20px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #e2e8f0;
        }

        .history-header h3 {
          margin: 0;
          color: #2d3748;
          font-size: 1.5em;
        }

        .history-actions {
          display: flex;
          gap: 10px;
        }

        .history-filters {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .filter-buttons {
          display: flex;
          gap: 10px;
        }

        .filter-btn {
          padding: 8px 16px;
          border: 2px solid #e2e8f0;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .filter-btn:hover {
          border-color: #667eea;
          color: #667eea;
        }

        .filter-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: #667eea;
        }

        .search-input {
          flex: 1;
          min-width: 200px;
          padding: 8px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.95em;
        }

        .history-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }

        .stat-item {
          text-align: center;
          padding: 15px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 10px;
        }

        .stat-label {
          display: block;
          font-size: 0.85em;
          color: #64748b;
          margin-bottom: 5px;
        }

        .stat-value {
          display: block;
          font-size: 1.8em;
          font-weight: 700;
          color: #667eea;
        }

        .history-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }

        .tab-btn {
          padding: 10px 20px;
          border: none;
          background: #f8fafc;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .tab-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .history-list {
          max-height: 500px;
          overflow-y: auto;
        }

        .history-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background: #f8fafc;
          border-radius: 10px;
          margin-bottom: 10px;
          transition: all 0.2s ease;
        }

        .history-item:hover {
          background: #e2e8f0;
          transform: translateX(5px);
        }

        .item-content {
          flex: 1;
        }

        .item-code-section {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-bottom: 5px;
        }

        .item-code {
          font-weight: 700;
          color: #2d3748;
          font-family: monospace;
          font-size: 1.1em;
        }

        .item-type {
          font-size: 1.2em;
        }

        .item-time {
          font-size: 0.85em;
          color: #64748b;
        }

        .item-actions {
          display: flex;
          gap: 10px;
        }

        .btn-use {
          padding: 6px 12px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9em;
        }

        .btn-delete {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.2em;
          opacity: 0.6;
        }

        .btn-delete:hover {
          opacity: 1;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #64748b;
        }

        .empty-state p {
          font-size: 1.2em;
        }

        @media (max-width: 768px) {
          .history-header {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
          }

          .history-filters {
            flex-direction: column;
          }

          .history-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

// エクスポート用のユーティリティ関数
export const addScanToHistory = (code, type = 'manual') => {
  const history = JSON.parse(localStorage.getItem('scanHistory') || '[]');
  const newEntry = {
    id: Date.now(),
    code: code,
    type: type,
    timestamp: new Date().toISOString()
  };
  const updatedHistory = [newEntry, ...history].slice(0, 100);
  localStorage.setItem('scanHistory', JSON.stringify(updatedHistory));
};

export default ScanHistory;
