import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

function QRCodeGenerator({ data, size = 200 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (data && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        data,
        {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        },
        (error) => {
          if (error) console.error('QRコード生成エラー:', error);
        }
      );
    }
  }, [data, size]);

  const downloadQR = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `qrcode-${data}.png`;
      link.href = url;
      link.click();
    }
  };

  return (
    <div className="qr-code-container">
      <canvas ref={canvasRef}></canvas>
      <button className="btn btn-secondary" onClick={downloadQR} style={{ marginTop: '10px' }}>
        📥 QRコード保存
      </button>
    </div>
  );
}

export default QRCodeGenerator;
