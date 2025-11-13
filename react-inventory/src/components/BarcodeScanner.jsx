import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

function BarcodeScanner({ onScan, onClose }) {
  const scannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        formatsToSupport: [
          0,  // QR_CODE
          8,  // CODE_128
          13, // CODE_39
          14, // EAN_13
          15, // EAN_8
        ]
      };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText, decodedResult) => {
          console.log('スキャン成功:', decodedText);
          onScan(decodedText, decodedResult);
          stopScanner();
        },
        (errorMessage) => {
          // スキャンエラーは無視（継続的にスキャン中のため）
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.error('カメラ起動エラー:', err);
      setError('カメラの起動に失敗しました。カメラの権限を許可してください。');
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

  return (
    <div className="scanner-modal">
      <div className="scanner-overlay" onClick={onClose}></div>
      <div className="scanner-content">
        <div className="scanner-header">
          <h2>📱 バーコード/QRコードスキャン</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {error ? (
          <div className="scanner-error">
            <p>❌ {error}</p>
            <button className="btn btn-primary" onClick={startScanner}>再試行</button>
          </div>
        ) : (
          <>
            <div id="qr-reader" ref={scannerRef}></div>
            <div className="scanner-instructions">
              <p>📷 カメラをバーコードまたはQRコードに向けてください</p>
              <p style={{ fontSize: '0.9em', color: '#64748b', marginTop: '10px' }}>
                対応形式: QRコード、CODE128、CODE39、EAN13、EAN8
              </p>
            </div>
          </>
        )}

        <div className="scanner-actions">
          <button className="btn btn-secondary" onClick={onClose}>キャンセル</button>
        </div>
      </div>

      <style jsx>{`
        .scanner-modal {
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

        .scanner-content {
          position: relative;
          background: white;
          border-radius: 20px;
          padding: 20px;
          max-width: 500px;
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
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          color: #2d3748;
          transform: scale(1.1);
        }

        #qr-reader {
          border-radius: 15px;
          overflow: hidden;
          margin: 20px 0;
        }

        .scanner-instructions {
          text-align: center;
          padding: 20px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 10px;
          margin: 20px 0;
        }

        .scanner-instructions p {
          margin: 5px 0;
          color: #2d3748;
          font-weight: 600;
        }

        .scanner-error {
          text-align: center;
          padding: 40px 20px;
        }

        .scanner-error p {
          color: #dc2626;
          font-size: 1.1em;
          margin-bottom: 20px;
        }

        .scanner-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 20px;
        }

        @media (max-width: 768px) {
          .scanner-content {
            width: 95%;
            padding: 15px;
          }

          .scanner-header h2 {
            font-size: 1.2em;
          }
        }
      `}</style>
    </div>
  );
}

export default BarcodeScanner;
