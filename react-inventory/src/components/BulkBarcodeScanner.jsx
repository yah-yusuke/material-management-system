import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

function BulkBarcodeScanner({ onScan, onComplete, onClose }) {
  const [scannedItems, setScannedItems] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const html5QrCodeRef = useRef(null);
  const [mode, setMode] = useState('continuous'); // 'continuous' or 'manual'

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode("bulk-qr-reader");
      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        formatsToSupport: [0, 8, 13, 14, 15]
      };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText, decodedResult) => {
          handleScanSuccess(decodedText, decodedResult);
        },
        (errorMessage) => {
          // 継続的スキャン中のエラーは無視
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.error('カメラ起動エラー:', err);
      setError('カメラの起動に失敗しました。');
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('スキャナー停止エラー:', err);
      }
    }
  };

  const handleScanSuccess = (code, result) => {
    // 重複チェック
    const isDuplicate = scannedItems.some(item => item.code === code);

    if (!isDuplicate || mode === 'continuous') {
      const newItem = {
        id: Date.now() + Math.random(),
        code: code,
        timestamp: new Date().toISOString(),
        format: result.decodedResult?.format || 'UNKNOWN',
        count: isDuplicate ? (scannedItems.find(i => i.code === code)?.count || 0) + 1 : 1
      };

      // バイブレーション
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }

      // 音声フィードバック
      playBeep();

      if (isDuplicate) {
        // 数量を増やす
        setScannedItems(prev =>
          prev.map(item =>
            item.code === code ? { ...item, count: item.count + 1, timestamp: new Date().toISOString() } : item
          )
        );
      } else {
        setScannedItems(prev => [...prev, newItem]);
      }

      // 個別コールバック
      onScan(code, result);
    }
  };

  const playBeep = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.3;

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const removeItem = (id) => {
    setScannedItems(prev => prev.filter(item => item.id !== id));
  };

  const clearAll = () => {
    if (confirm('すべてのスキャン結果をクリアしますか？')) {
      setScannedItems([]);
    }
  };

  const handleComplete = () => {
    onComplete(scannedItems);
    onClose();
  };

  return (
    <div className="bulk-scanner-modal">
      <div className="scanner-overlay" onClick={onClose}></div>
      <div className="bulk-scanner-content">
        <div className="scanner-header">
          <h2>📦 一括バーコードスキャン</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="scanner-mode">
          <label>
            <input
              type="radio"
              value="continuous"
              checked={mode === 'continuous'}
              onChange={(e) => setMode(e.target.value)}
            />
            連続モード（同じコードも追加）
          </label>
          <label>
            <input
              type="radio"
              value="manual"
              checked={mode === 'manual'}
              onChange={(e) => setMode(e.target.value)}
            />
            ユニークモード（重複無視）
          </label>
        </div>

        {error ? (
          <div className="scanner-error">
            <p>❌ {error}</p>
            <button className="btn btn-primary" onClick={startScanner}>再試行</button>
          </div>
        ) : (
          <>
            <div id="bulk-qr-reader"></div>

            <div className="scanned-count">
              <span className="count-badge">{scannedItems.length}</span> 件スキャン済み
              {scannedItems.length > 0 && (
                <button className="btn-clear" onClick={clearAll}>クリア</button>
              )}
            </div>

            <div className="scanned-items-list">
              {scannedItems.map(item => (
                <div key={item.id} className="scanned-item">
                  <div className="item-info">
                    <span className="item-code">{item.code}</span>
                    <span className="item-format">{item.format}</span>
                    {item.count > 1 && <span className="item-count">× {item.count}</span>}
                  </div>
                  <div className="item-actions">
                    <span className="item-time">{new Date(item.timestamp).toLocaleTimeString('ja-JP')}</span>
                    <button className="btn-remove" onClick={() => removeItem(item.id)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="scanner-actions">
          <button
            className="btn btn-primary"
            onClick={handleComplete}
            disabled={scannedItems.length === 0}
          >
            完了 ({scannedItems.length}件)
          </button>
          <button className="btn btn-secondary" onClick={onClose}>キャンセル</button>
        </div>
      </div>

      <style jsx>{`
        .bulk-scanner-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .scanner-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
        }

        .bulk-scanner-content {
          position: relative;
          background: white;
          border-radius: 20px;
          padding: 20px;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .scanner-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #e2e8f0;
        }

        .scanner-header h2 {
          font-size: 1.5em;
          color: #2d3748;
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5em;
          color: #64748b;
          cursor: pointer;
          padding: 5px 10px;
        }

        .scanner-mode {
          display: flex;
          gap: 20px;
          margin-bottom: 15px;
          padding: 10px;
          background: #f8fafc;
          border-radius: 10px;
        }

        .scanner-mode label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 0.9em;
        }

        #bulk-qr-reader {
          border-radius: 15px;
          overflow: hidden;
          margin: 20px 0;
        }

        .scanned-count {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 10px;
          margin-bottom: 15px;
          font-weight: 600;
        }

        .count-badge {
          display: inline-block;
          background: white;
          color: #667eea;
          padding: 5px 15px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 1.2em;
          margin-right: 10px;
        }

        .btn-clear {
          background: rgba(255, 255, 255, 0.3);
          color: white;
          border: 1px solid white;
          padding: 5px 15px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        .scanned-items-list {
          max-height: 300px;
          overflow-y: auto;
          margin-bottom: 20px;
        }

        .scanned-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #f8fafc;
          border-radius: 10px;
          margin-bottom: 10px;
          transition: all 0.2s ease;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            transform: translateX(-20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .scanned-item:hover {
          background: #e2e8f0;
        }

        .item-info {
          display: flex;
          gap: 10px;
          align-items: center;
          flex: 1;
        }

        .item-code {
          font-weight: 700;
          color: #2d3748;
          font-family: monospace;
        }

        .item-format {
          font-size: 0.8em;
          color: #64748b;
          padding: 2px 8px;
          background: white;
          border-radius: 5px;
        }

        .item-count {
          background: #667eea;
          color: white;
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 0.9em;
          font-weight: 600;
        }

        .item-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .item-time {
          font-size: 0.85em;
          color: #64748b;
        }

        .btn-remove {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.2em;
          opacity: 0.6;
          transition: opacity 0.2s;
        }

        .btn-remove:hover {
          opacity: 1;
        }

        .scanner-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
        }

        .scanner-error {
          text-align: center;
          padding: 40px 20px;
        }

        @media (max-width: 768px) {
          .bulk-scanner-content {
            width: 95%;
            padding: 15px;
          }

          .scanner-mode {
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
}

export default BulkBarcodeScanner;
