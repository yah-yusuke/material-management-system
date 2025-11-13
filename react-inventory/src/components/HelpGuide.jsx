import { useState } from 'react';

function HelpGuide({ onClose }) {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = {
    overview: {
      title: '📚 機能概要',
      icon: '📚',
      content: (
        <>
          <h3>材料在庫管理システムへようこそ</h3>
          <p>このシステムは、製造業や倉庫管理のための包括的な在庫管理ソリューションです。</p>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">📦</div>
              <h4>在庫管理</h4>
              <p>リアルタイムで在庫数を追跡・管理</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h4>モバイル対応</h4>
              <p>PWAでスマホアプリのように使用</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📷</div>
              <h4>バーコードスキャン</h4>
              <p>カメラでQR・バーコードを読取</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔄</div>
              <h4>オフライン対応</h4>
              <p>ネット接続なしでも動作</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔔</div>
              <h4>通知機能</h4>
              <p>在庫アラートをプッシュ通知</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h4>データ分析</h4>
              <p>ABC分析や回転率を自動計算</p>
            </div>
          </div>
        </>
      )
    },
    barcode: {
      title: '📷 バーコードスキャン',
      icon: '📷',
      content: (
        <>
          <h3>バーコード・QRコードスキャン</h3>

          <div className="guide-section">
            <h4>🔍 単一スキャン</h4>
            <ol>
              <li>「📷 スキャン」ボタンをクリック</li>
              <li>カメラの使用を許可</li>
              <li>バーコード/QRコードをカメラに向ける</li>
              <li>自動的に読み取られます</li>
            </ol>

            <div className="tip-box">
              <strong>💡 ヒント:</strong>
              <ul>
                <li>コードから20-30cm程度離す</li>
                <li>照明が十分な場所で使用</li>
                <li>コードが画面中央に来るように</li>
              </ul>
            </div>
          </div>

          <div className="guide-section">
            <h4>📦 一括スキャン</h4>
            <ol>
              <li>「📦 一括スキャン」ボタンをクリック</li>
              <li>スキャンモードを選択:
                <ul>
                  <li><strong>Unique:</strong> 重複を統合して数量カウント</li>
                  <li><strong>Continuous:</strong> すべてのスキャンを個別に記録</li>
                </ul>
              </li>
              <li>複数のコードを順次スキャン</li>
              <li>スキャン成功時にバイブレーション＆ビープ音</li>
              <li>「完了」で処理実行</li>
            </ol>

            <div className="feature-highlight">
              <strong>✨ 一括スキャンの便利機能:</strong>
              <ul>
                <li>📊 リアルタイムでスキャン数を表示</li>
                <li>🔢 重複カウント機能</li>
                <li>🗑️ 個別アイテムの削除</li>
                <li>📳 触覚フィードバック（対応端末のみ）</li>
              </ul>
            </div>
          </div>

          <div className="guide-section">
            <h4>📜 スキャン履歴</h4>
            <p>過去のスキャン履歴を確認・再利用できます。</p>
            <ul>
              <li><strong>フィルタ:</strong> すべて / 今日 / 過去7日間</li>
              <li><strong>検索:</strong> コードで検索</li>
              <li><strong>再利用:</strong> 履歴からコードを選択して入力</li>
              <li><strong>エクスポート:</strong> CSV形式でダウンロード</li>
            </ul>
          </div>

          <div className="supported-formats">
            <h4>対応フォーマット</h4>
            <div className="format-tags">
              <span className="tag">QR Code</span>
              <span className="tag">CODE-128</span>
              <span className="tag">CODE-39</span>
              <span className="tag">EAN-13</span>
              <span className="tag">EAN-8</span>
            </div>
          </div>
        </>
      )
    },
    sync: {
      title: '🔄 オフライン同期',
      icon: '🔄',
      content: (
        <>
          <h3>バックグラウンド同期</h3>

          <div className="guide-section">
            <h4>📡 オフライン動作</h4>
            <p>インターネット接続がない環境でも安心して使用できます。</p>

            <div className="workflow">
              <div className="workflow-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h5>オフライン時の操作</h5>
                  <p>入庫・出庫などの操作を通常通り実行</p>
                </div>
              </div>
              <div className="workflow-arrow">↓</div>
              <div className="workflow-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h5>キューに保存</h5>
                  <p>データは自動的にローカルキューに保存</p>
                </div>
              </div>
              <div className="workflow-arrow">↓</div>
              <div className="workflow-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h5>オンライン復帰</h5>
                  <p>接続が復旧したら自動検知</p>
                </div>
              </div>
              <div className="workflow-arrow">↓</div>
              <div className="workflow-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h5>自動同期</h5>
                  <p>キュー内のデータを自動的にサーバーへ送信</p>
                </div>
              </div>
            </div>
          </div>

          <div className="guide-section">
            <h4>📊 同期状態の確認</h4>
            <p>画面上部の同期ステータスバーで確認できます：</p>
            <ul>
              <li><span className="status-badge online">🌐 オンライン</span> - サーバーと接続中</li>
              <li><span className="status-badge offline">📡 オフライン</span> - 接続なし、ローカル保存モード</li>
              <li><span className="status-badge syncing">🔄 同期中</span> - データ送信中</li>
            </ul>
          </div>

          <div className="guide-section">
            <h4>🔧 手動同期・再試行</h4>
            <p>必要に応じて手動で同期を実行できます：</p>
            <ol>
              <li>同期ステータスバーの「🔄 同期」ボタンをクリック</li>
              <li>失敗したアイテムがある場合は「🔄 再試行」で再送信</li>
            </ol>

            <div className="warning-box">
              <strong>⚠️ 注意:</strong>
              <p>キューに保存されたデータは同期完了まで削除しないでください。</p>
            </div>
          </div>

          <div className="guide-section">
            <h4>📋 対応する操作</h4>
            <ul>
              <li>✅ 入庫処理</li>
              <li>✅ 出庫処理</li>
              <li>✅ 材料マスタの追加・編集</li>
              <li>✅ 在庫調整</li>
            </ul>
          </div>
        </>
      )
    },
    notifications: {
      title: '🔔 プッシュ通知',
      icon: '🔔',
      content: (
        <>
          <h3>プッシュ通知設定</h3>

          <div className="guide-section">
            <h4>🔧 初期設定</h4>
            <ol>
              <li>設定画面を開く</li>
              <li>「🔔 通知を有効にする」ボタンをクリック</li>
              <li>ブラウザの通知許可ダイアログで「許可」を選択</li>
              <li>「📬 プッシュ通知を購読」をクリック</li>
              <li>「🔔 テスト通知を送信」で動作確認</li>
            </ol>

            <div className="tip-box">
              <strong>💡 ヒント:</strong>
              <p>HTTPS接続またはlocalhost環境が必要です。本番環境でのみ完全に動作します。</p>
            </div>
          </div>

          <div className="guide-section">
            <h4>📢 通知される内容</h4>
            <div className="notification-types">
              <div className="notification-type">
                <div className="notif-icon">⚠️</div>
                <div>
                  <h5>在庫切れアラート</h5>
                  <p>材料の在庫がゼロになった時</p>
                </div>
              </div>
              <div className="notification-type">
                <div className="notif-icon">📉</div>
                <div>
                  <h5>在庫少量警告</h5>
                  <p>最小在庫量を下回った時</p>
                </div>
              </div>
              <div className="notification-type">
                <div className="notif-icon">📦</div>
                <div>
                  <h5>発注推奨</h5>
                  <p>発注点に達した時</p>
                </div>
              </div>
              <div className="notification-type">
                <div className="notif-icon">⏰</div>
                <div>
                  <h5>有効期限警告</h5>
                  <p>材料の有効期限が近づいた時</p>
                </div>
              </div>
            </div>
          </div>

          <div className="guide-section">
            <h4>📱 モバイルでの受信</h4>
            <p>PWAとしてインストールすると、アプリを閉じていても通知を受信できます。</p>
            <ol>
              <li>ブラウザのメニューから「ホーム画面に追加」</li>
              <li>アプリアイコンからアクセス</li>
              <li>バックグラウンドでも通知を受信</li>
            </ol>
          </div>

          <div className="guide-section">
            <h4>🚫 通知を停止するには</h4>
            <ol>
              <li>設定画面の「📭 購読解除」をクリック</li>
              <li>または、ブラウザの設定から通知をオフ</li>
            </ol>
          </div>
        </>
      )
    },
    pwa: {
      title: '📱 PWA インストール',
      icon: '📱',
      content: (
        <>
          <h3>アプリとしてインストール</h3>

          <div className="guide-section">
            <h4>💻 PCでのインストール</h4>

            <div className="install-steps">
              <h5>Chrome / Edge:</h5>
              <ol>
                <li>アドレスバー右側の「⊕」または「💻」アイコンをクリック</li>
                <li>「インストール」をクリック</li>
                <li>デスクトップにアプリアイコンが追加されます</li>
              </ol>

              <h5>Safari (Mac):</h5>
              <ol>
                <li>ファイルメニュー → 「ホーム画面に追加」</li>
                <li>名前を確認して「追加」</li>
              </ol>
            </div>
          </div>

          <div className="guide-section">
            <h4>📱 スマホでのインストール</h4>

            <div className="install-steps">
              <h5>Android (Chrome):</h5>
              <ol>
                <li>画面下部に表示される「ホーム画面に追加」バナーをタップ</li>
                <li>または、メニュー (⋮) → 「アプリをインストール」</li>
                <li>「インストール」をタップ</li>
              </ol>

              <h5>iPhone / iPad (Safari):</h5>
              <ol>
                <li>画面下部の共有ボタン <span style={{fontSize: '1.2em'}}>□↑</span> をタップ</li>
                <li>下にスクロールして「ホーム画面に追加」をタップ</li>
                <li>「追加」をタップ</li>
              </ol>
            </div>
          </div>

          <div className="guide-section">
            <h4>✨ インストール後のメリット</h4>
            <div className="benefits">
              <div className="benefit-item">
                <span className="benefit-icon">⚡</span>
                <div>
                  <h5>高速起動</h5>
                  <p>ネイティブアプリのような速度</p>
                </div>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">📡</span>
                <div>
                  <h5>オフライン動作</h5>
                  <p>ネット接続なしでも使用可能</p>
                </div>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">🔔</span>
                <div>
                  <h5>プッシュ通知</h5>
                  <p>バックグラウンドでも通知受信</p>
                </div>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">🖥️</span>
                <div>
                  <h5>フルスクリーン</h5>
                  <p>ブラウザUIなしで広々表示</p>
                </div>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">🏠</span>
                <div>
                  <h5>ホーム画面</h5>
                  <p>ワンタップでアクセス</p>
                </div>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">💾</span>
                <div>
                  <h5>自動更新</h5>
                  <p>常に最新バージョンを使用</p>
                </div>
              </div>
            </div>
          </div>

          <div className="guide-section">
            <h4>🗑️ アンインストール方法</h4>
            <ul>
              <li><strong>PC:</strong> アプリウィンドウのメニュー → 「アンインストール」</li>
              <li><strong>Android:</strong> アプリアイコンを長押し → 「アンインストール」</li>
              <li><strong>iOS:</strong> アイコンを長押し → 「Appを削除」</li>
            </ul>
          </div>
        </>
      )
    },
    troubleshooting: {
      title: '🔧 トラブルシューティング',
      icon: '🔧',
      content: (
        <>
          <h3>よくある問題と解決方法</h3>

          <div className="troubleshooting-item">
            <h4>📷 カメラが起動しない</h4>
            <div className="solution">
              <p><strong>原因:</strong> カメラの権限が許可されていない</p>
              <p><strong>解決方法:</strong></p>
              <ol>
                <li>ブラウザの設定を開く</li>
                <li>サイトの設定 → カメラ</li>
                <li>このサイトに「許可」を設定</li>
                <li>ページを再読み込み</li>
              </ol>
            </div>
          </div>

          <div className="troubleshooting-item">
            <h4>📡 同期が実行されない</h4>
            <div className="solution">
              <p><strong>確認事項:</strong></p>
              <ul>
                <li>✓ オンライン状態か確認（WiFi/モバイルデータ）</li>
                <li>✓ 同期キューにデータがあるか確認</li>
                <li>✓ Service Workerが登録されているか確認</li>
              </ul>
              <p><strong>解決方法:</strong></p>
              <ol>
                <li>「🔄 同期」ボタンを手動でクリック</li>
                <li>それでも失敗する場合は「🔄 再試行」</li>
                <li>ブラウザのキャッシュをクリアして再読み込み</li>
              </ol>
            </div>
          </div>

          <div className="troubleshooting-item">
            <h4>🔔 通知が届かない</h4>
            <div className="solution">
              <p><strong>確認事項:</strong></p>
              <ul>
                <li>✓ 通知権限が「許可」になっているか</li>
                <li>✓ プッシュ通知を購読しているか</li>
                <li>✓ HTTPS接続か（本番環境）</li>
                <li>✓ 端末の通知設定がオンか</li>
              </ul>
              <p><strong>解決方法:</strong></p>
              <ol>
                <li>設定画面で「🔔 テスト通知を送信」を試す</li>
                <li>端末の設定でブラウザの通知を許可</li>
                <li>PWAとしてインストールし直す</li>
              </ol>
            </div>
          </div>

          <div className="troubleshooting-item">
            <h4>📦 バーコードが読み取れない</h4>
            <div className="solution">
              <p><strong>原因:</strong> 照明・距離・角度の問題</p>
              <p><strong>解決方法:</strong></p>
              <ul>
                <li>💡 明るい場所で使用する</li>
                <li>📏 コードから20-30cm離す</li>
                <li>📐 コードを平らにして正面から撮影</li>
                <li>🔍 コード全体がカメラに収まるように</li>
                <li>🧹 カメラレンズを拭く</li>
              </ul>
            </div>
          </div>

          <div className="troubleshooting-item">
            <h4>💾 データが保存されない</h4>
            <div className="solution">
              <p><strong>確認事項:</strong></p>
              <ul>
                <li>✓ ブラウザのストレージ容量が十分か</li>
                <li>✓ プライベートブラウジングモードではないか</li>
                <li>✓ Cookieが有効か</li>
              </ul>
              <p><strong>解決方法:</strong></p>
              <ol>
                <li>通常のブラウジングモードで使用</li>
                <li>ブラウザの設定でCookieとサイトデータを許可</li>
                <li>不要なキャッシュを削除して容量確保</li>
              </ol>
            </div>
          </div>

          <div className="troubleshooting-item">
            <h4>⚡ 動作が遅い</h4>
            <div className="solution">
              <p><strong>解決方法:</strong></p>
              <ul>
                <li>🧹 ブラウザのキャッシュをクリア</li>
                <li>🔄 ページを再読み込み（Ctrl+Shift+R / Cmd+Shift+R）</li>
                <li>🗑️ 古いスキャン履歴を削除</li>
                <li>📱 使用していない他のタブを閉じる</li>
                <li>🔌 端末を再起動</li>
              </ul>
            </div>
          </div>

          <div className="help-contact">
            <h4>💬 それでも解決しない場合</h4>
            <p>システム管理者にお問い合わせください。以下の情報を伝えるとスムーズです：</p>
            <ul>
              <li>使用しているブラウザとバージョン</li>
              <li>端末の種類（PC/スマホ/タブレット）</li>
              <li>発生している問題の詳細</li>
              <li>エラーメッセージ（あれば）</li>
            </ul>
          </div>
        </>
      )
    }
  };

  const menuItems = [
    { id: 'overview', label: '機能概要', icon: '📚' },
    { id: 'barcode', label: 'バーコードスキャン', icon: '📷' },
    { id: 'sync', label: 'オフライン同期', icon: '🔄' },
    { id: 'notifications', label: 'プッシュ通知', icon: '🔔' },
    { id: 'pwa', label: 'PWAインストール', icon: '📱' },
    { id: 'troubleshooting', label: 'トラブルシューティング', icon: '🔧' }
  ];

  return (
    <div className="help-guide-overlay">
      <div className="help-guide-container">
        <div className="help-header">
          <h2>📖 使い方ガイド</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="help-content">
          <div className="help-sidebar">
            {menuItems.map(item => (
              <button
                key={item.id}
                className={`menu-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="help-main">
            <div className="section-content">
              {sections[activeSection].content}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .help-guide-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10000;
          padding: 20px;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .help-guide-container {
          background: white;
          border-radius: 20px;
          width: 100%;
          max-width: 1200px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .help-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 25px 30px;
          border-bottom: 2px solid #e2e8f0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 20px 20px 0 0;
        }

        .help-header h2 {
          margin: 0;
          font-size: 1.8em;
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          color: white;
          font-size: 1.5em;
          cursor: pointer;
          transition: all 0.3s;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: rotate(90deg);
        }

        .help-content {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        .help-sidebar {
          width: 280px;
          background: #f8fafc;
          border-right: 1px solid #e2e8f0;
          overflow-y: auto;
          padding: 20px 10px;
        }

        .menu-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px 20px;
          background: transparent;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s;
          margin-bottom: 8px;
          text-align: left;
          font-size: 1em;
        }

        .menu-item:hover {
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .menu-item.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .menu-icon {
          font-size: 1.5em;
        }

        .menu-label {
          font-weight: 600;
        }

        .help-main {
          flex: 1;
          overflow-y: auto;
          padding: 40px;
        }

        .section-content h3 {
          color: #2d3748;
          font-size: 2em;
          margin: 0 0 25px 0;
          padding-bottom: 15px;
          border-bottom: 3px solid #667eea;
        }

        .section-content h4 {
          color: #4a5568;
          font-size: 1.4em;
          margin: 30px 0 15px 0;
        }

        .section-content h5 {
          color: #667eea;
          font-size: 1.1em;
          margin: 20px 0 10px 0;
        }

        .section-content p {
          color: #64748b;
          line-height: 1.8;
          margin: 12px 0;
        }

        .section-content ol,
        .section-content ul {
          color: #64748b;
          line-height: 1.8;
          padding-left: 25px;
        }

        .section-content li {
          margin: 8px 0;
        }

        .guide-section {
          background: #f8fafc;
          padding: 25px;
          border-radius: 15px;
          margin: 25px 0;
          border-left: 4px solid #667eea;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin: 25px 0;
        }

        .feature-card {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 25px;
          border-radius: 15px;
          text-align: center;
          transition: all 0.3s;
          border: 2px solid transparent;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          border-color: #667eea;
        }

        .feature-icon {
          font-size: 3em;
          margin-bottom: 15px;
        }

        .feature-card h4 {
          color: #2d3748;
          margin: 10px 0;
          font-size: 1.2em;
        }

        .feature-card p {
          color: #64748b;
          font-size: 0.9em;
          margin: 0;
        }

        .tip-box {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          padding: 20px;
          border-radius: 12px;
          margin: 20px 0;
          border-left: 4px solid #3b82f6;
        }

        .tip-box strong {
          color: #1e40af;
          display: block;
          margin-bottom: 10px;
          font-size: 1.1em;
        }

        .tip-box ul {
          margin: 10px 0 0 0;
          color: #1e3a8a;
        }

        .warning-box {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          padding: 20px;
          border-radius: 12px;
          margin: 20px 0;
          border-left: 4px solid #f59e0b;
        }

        .warning-box strong {
          color: #92400e;
          display: block;
          margin-bottom: 10px;
          font-size: 1.1em;
        }

        .warning-box p {
          color: #78350f;
          margin: 0;
        }

        .feature-highlight {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          padding: 20px;
          border-radius: 12px;
          margin: 20px 0;
          border-left: 4px solid #10b981;
        }

        .feature-highlight strong {
          color: #065f46;
          display: block;
          margin-bottom: 10px;
          font-size: 1.1em;
        }

        .feature-highlight ul {
          margin: 10px 0 0 0;
          color: #047857;
        }

        .supported-formats {
          margin: 25px 0;
        }

        .format-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 15px;
        }

        .tag {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.9em;
        }

        .workflow {
          margin: 25px 0;
        }

        .workflow-step {
          display: flex;
          gap: 20px;
          align-items: flex-start;
          margin: 15px 0;
        }

        .step-number {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.2em;
          flex-shrink: 0;
        }

        .step-content h5 {
          margin: 0 0 5px 0;
          color: #2d3748;
        }

        .step-content p {
          margin: 0;
          color: #64748b;
        }

        .workflow-arrow {
          text-align: center;
          color: #cbd5e1;
          font-size: 2em;
          font-weight: 700;
          margin: 5px 0;
        }

        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.9em;
          margin: 5px 5px 5px 0;
        }

        .status-badge.online {
          background: #d1fae5;
          color: #065f46;
        }

        .status-badge.offline {
          background: #fee2e2;
          color: #991b1b;
        }

        .status-badge.syncing {
          background: #dbeafe;
          color: #1e40af;
        }

        .notification-types {
          margin: 20px 0;
        }

        .notification-type {
          display: flex;
          gap: 15px;
          align-items: flex-start;
          padding: 15px;
          background: white;
          border-radius: 12px;
          margin: 10px 0;
          border: 2px solid #e2e8f0;
        }

        .notif-icon {
          font-size: 2em;
        }

        .notification-type h5 {
          margin: 0 0 5px 0;
          color: #2d3748;
        }

        .notification-type p {
          margin: 0;
          color: #64748b;
          font-size: 0.9em;
        }

        .install-steps {
          margin: 20px 0;
        }

        .benefits {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
          margin: 20px 0;
        }

        .benefit-item {
          display: flex;
          gap: 15px;
          align-items: flex-start;
          padding: 20px;
          background: white;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
          transition: all 0.3s;
        }

        .benefit-item:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        }

        .benefit-icon {
          font-size: 2em;
        }

        .benefit-item h5 {
          margin: 0 0 5px 0;
          color: #2d3748;
          font-size: 1em;
        }

        .benefit-item p {
          margin: 0;
          color: #64748b;
          font-size: 0.85em;
        }

        .troubleshooting-item {
          background: #f8fafc;
          padding: 25px;
          border-radius: 15px;
          margin: 20px 0;
          border-left: 4px solid #ef4444;
        }

        .troubleshooting-item h4 {
          color: #dc2626;
          margin-top: 0;
        }

        .solution {
          margin-top: 15px;
        }

        .solution p strong {
          color: #2d3748;
        }

        .help-contact {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 15px;
          margin: 30px 0 0 0;
        }

        .help-contact h4 {
          color: white;
          margin-top: 0;
        }

        .help-contact p,
        .help-contact li {
          color: rgba(255, 255, 255, 0.95);
        }

        @media (max-width: 768px) {
          .help-guide-container {
            max-height: 100vh;
            border-radius: 0;
          }

          .help-content {
            flex-direction: column;
          }

          .help-sidebar {
            width: 100%;
            max-height: 200px;
            border-right: none;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            overflow-x: auto;
            overflow-y: hidden;
            padding: 10px;
          }

          .menu-item {
            flex-direction: column;
            min-width: 100px;
            padding: 12px;
            text-align: center;
          }

          .menu-label {
            font-size: 0.8em;
          }

          .help-main {
            padding: 20px;
          }

          .section-content h3 {
            font-size: 1.5em;
          }

          .feature-grid {
            grid-template-columns: 1fr;
          }

          .benefits {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default HelpGuide;
