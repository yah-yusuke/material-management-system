import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import * as XLSX from 'xlsx'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [materials, setMaterials] = useState([])
  const [transactions, setTransactions] = useState([])
  const [inventory, setInventory] = useState({})
  const [alerts, setAlerts] = useState([])

  // フォームステート
  const [materialForm, setMaterialForm] = useState({
    code: '',
    name: '',
    spec: '',
    unit: '個',
    minStock: '',
    optimalStock: '',
    warehouse: '第1倉庫',
    shelfNumber: '',
    remarks: ''
  })

  const [receivingForm, setReceivingForm] = useState({
    materialCode: '',
    date: new Date().toISOString().split('T')[0],
    quantity: '',
    lot: '',
    supplier: '',
    remarks: ''
  })

  const [shippingForm, setShippingForm] = useState({
    materialCode: '',
    date: new Date().toISOString().split('T')[0],
    quantity: '',
    destination: '',
    jobNumber: '',
    remarks: ''
  })

  // フィルタステート
  const [materialFilter, setMaterialFilter] = useState({ search: '', warehouse: '' })
  const [inventoryFilter, setInventoryFilter] = useState({ search: '', stock: '', warehouse: '' })
  const [historyFilter, setHistoryFilter] = useState({ dateFrom: '', dateTo: '', material: '', type: '' })

  // データ読み込み
  useEffect(() => {
    loadData()
  }, [])

  // アラート確認
  useEffect(() => {
    checkStockAlerts()
  }, [materials, inventory])

  const loadData = () => {
    const savedMaterials = localStorage.getItem('materials')
    const savedTransactions = localStorage.getItem('transactions')
    const savedInventory = localStorage.getItem('inventory')

    if (savedMaterials) setMaterials(JSON.parse(savedMaterials))
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions))
    if (savedInventory) setInventory(JSON.parse(savedInventory))

    // サンプルデータ作成
    if (!savedMaterials) {
      createSampleData()
    }
  }

  const saveData = (newMaterials, newTransactions, newInventory) => {
    if (newMaterials !== undefined) {
      setMaterials(newMaterials)
      localStorage.setItem('materials', JSON.stringify(newMaterials))
    }
    if (newTransactions !== undefined) {
      setTransactions(newTransactions)
      localStorage.setItem('transactions', JSON.stringify(newTransactions))
    }
    if (newInventory !== undefined) {
      setInventory(newInventory)
      localStorage.setItem('inventory', JSON.stringify(newInventory))
    }
  }

  const createSampleData = () => {
    const sampleMaterials = [
      {
        id: generateId(),
        code: 'MAT-001',
        name: 'ステンレス棒材',
        spec: 'SUS304 φ50×500L',
        unit: '本',
        minStock: 10,
        optimalStock: 30,
        warehouse: '第1倉庫',
        shelfNumber: 'A-01',
        remarks: ''
      },
      {
        id: generateId(),
        code: 'MAT-002',
        name: '鉄板',
        spec: 'SS400 t6×1000×2000',
        unit: '枚',
        minStock: 5,
        optimalStock: 15,
        warehouse: '第1倉庫',
        shelfNumber: 'B-03',
        remarks: ''
      },
      {
        id: generateId(),
        code: 'MAT-003',
        name: 'アルミ角材',
        spec: 'A5052 50×50×1000L',
        unit: '本',
        minStock: 20,
        optimalStock: 50,
        warehouse: '第2倉庫',
        shelfNumber: 'C-05',
        remarks: ''
      }
    ]

    const sampleInventory = {}
    sampleMaterials.forEach(material => {
      sampleInventory[material.code] = {
        quantity: material.optimalStock || material.minStock * 2,
        lastUpdated: new Date().toISOString()
      }
    })

    const sampleTransactions = []
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo)
      date.setDate(date.getDate() + i)

      sampleMaterials.forEach(material => {
        if (Math.random() > 0.7) {
          const type = Math.random() > 0.5 ? 'in' : 'out'
          const quantity = Math.floor(Math.random() * 5) + 1

          sampleTransactions.push({
            id: generateId(),
            date: date.toISOString().split('T')[0],
            type: type,
            materialCode: material.code,
            materialName: material.name,
            quantity: quantity,
            unit: material.unit,
            balance: sampleInventory[material.code].quantity,
            remarks: type === 'in' ? '定期入庫' : '製造使用'
          })
        }
      })
    }

    saveData(sampleMaterials, sampleTransactions, sampleInventory)
  }

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  const checkStockAlerts = () => {
    const newAlerts = []
    materials.forEach(material => {
      const stock = inventory[material.code]?.quantity || 0
      if (stock === 0) {
        newAlerts.push({
          type: 'critical',
          message: `${material.name}（${material.code}）が在庫切れです`
        })
      } else if (stock <= material.minStock) {
        newAlerts.push({
          type: 'warning',
          message: `${material.name}（${material.code}）の在庫が最低在庫数を下回っています（現在: ${stock}${material.unit}）`
        })
      }
    })
    setAlerts(newAlerts)
  }

  const saveMaterial = (e) => {
    e.preventDefault()

    if (materials.some(m => m.code === materialForm.code)) {
      alert('この材料コードは既に登録されています。')
      return
    }

    const newMaterial = {
      id: generateId(),
      ...materialForm,
      minStock: parseFloat(materialForm.minStock),
      optimalStock: parseFloat(materialForm.optimalStock) || 0
    }

    const newMaterials = [...materials, newMaterial]
    const newInventory = { ...inventory }
    newInventory[newMaterial.code] = {
      quantity: 0,
      lastUpdated: new Date().toISOString()
    }

    saveData(newMaterials, undefined, newInventory)

    setMaterialForm({
      code: '',
      name: '',
      spec: '',
      unit: '個',
      minStock: '',
      optimalStock: '',
      warehouse: '第1倉庫',
      shelfNumber: '',
      remarks: ''
    })

    showNotification('材料マスタを登録しました')
  }

  const deleteMaterial = (id) => {
    if (!confirm('この材料を削除してもよろしいですか？')) return

    const newMaterials = materials.filter(m => m.id !== id)
    saveData(newMaterials, undefined, undefined)
    showNotification('材料を削除しました')
  }

  const saveReceiving = (e) => {
    e.preventDefault()

    const material = materials.find(m => m.code === receivingForm.materialCode)
    const quantity = parseFloat(receivingForm.quantity)

    const newInventory = { ...inventory }
    if (!newInventory[receivingForm.materialCode]) {
      newInventory[receivingForm.materialCode] = { quantity: 0, lastUpdated: new Date().toISOString() }
    }

    newInventory[receivingForm.materialCode].quantity += quantity
    newInventory[receivingForm.materialCode].lastUpdated = new Date().toISOString()

    const transaction = {
      id: generateId(),
      date: receivingForm.date,
      type: 'in',
      materialCode: receivingForm.materialCode,
      materialName: material.name,
      quantity: quantity,
      unit: material.unit,
      balance: newInventory[receivingForm.materialCode].quantity,
      lot: receivingForm.lot,
      supplier: receivingForm.supplier,
      remarks: receivingForm.remarks
    }

    const newTransactions = [...transactions, transaction]
    saveData(undefined, newTransactions, newInventory)

    setReceivingForm({
      materialCode: '',
      date: new Date().toISOString().split('T')[0],
      quantity: '',
      lot: '',
      supplier: '',
      remarks: ''
    })

    showNotification('入庫を登録しました')
  }

  const saveShipping = (e) => {
    e.preventDefault()

    const material = materials.find(m => m.code === shippingForm.materialCode)
    const quantity = parseFloat(shippingForm.quantity)

    if (!inventory[shippingForm.materialCode] || inventory[shippingForm.materialCode].quantity < quantity) {
      alert('在庫が不足しています')
      return
    }

    const newInventory = { ...inventory }
    newInventory[shippingForm.materialCode].quantity -= quantity
    newInventory[shippingForm.materialCode].lastUpdated = new Date().toISOString()

    const transaction = {
      id: generateId(),
      date: shippingForm.date,
      type: 'out',
      materialCode: shippingForm.materialCode,
      materialName: material.name,
      quantity: quantity,
      unit: material.unit,
      balance: newInventory[shippingForm.materialCode].quantity,
      destination: shippingForm.destination,
      jobNumber: shippingForm.jobNumber,
      remarks: shippingForm.remarks
    }

    const newTransactions = [...transactions, transaction]
    saveData(undefined, newTransactions, newInventory)

    setShippingForm({
      materialCode: '',
      date: new Date().toISOString().split('T')[0],
      quantity: '',
      destination: '',
      jobNumber: '',
      remarks: ''
    })

    showNotification('出庫を登録しました')
  }

  const showNotification = (message) => {
    const newAlert = { type: 'success', message }
    setAlerts(prev => [newAlert, ...prev])
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a !== newAlert))
    }, 3000)
  }

  const exportToCSV = (data, filename) => {
    const csv = data.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const bom = '\uFEFF'
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
  }

  const exportToExcel = (data, sheetName, filename) => {
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
    XLSX.writeFile(wb, filename)
  }

  const exportInventoryToCSV = () => {
    const headers = ['材料コード', '材料名', '規格', '現在庫', '単位', '最低在庫数', '適正在庫数', '倉庫', '棚番号']
    const rows = materials.map(m => {
      const stock = inventory[m.code]?.quantity || 0
      return [m.code, m.name, m.spec, stock, m.unit, m.minStock, m.optimalStock || '', m.warehouse, m.shelfNumber]
    })
    exportToCSV([headers, ...rows], '在庫一覧.csv')
  }

  const exportInventoryToExcel = () => {
    const data = materials.map(m => {
      const stock = inventory[m.code]?.quantity || 0
      return {
        '材料コード': m.code,
        '材料名': m.name,
        '規格': m.spec,
        '現在庫': stock,
        '単位': m.unit,
        '最低在庫数': m.minStock,
        '適正在庫数': m.optimalStock || '',
        '倉庫': m.warehouse,
        '棚番号': m.shelfNumber
      }
    })
    exportToExcel(data, '在庫一覧', '在庫一覧.xlsx')
  }

  const exportHistoryToCSV = () => {
    const headers = ['日付', '種別', '材料コード', '材料名', '数量', '単位', '在庫残', '備考']
    const rows = transactions.map(t => [
      t.date,
      t.type === 'in' ? '入庫' : '出庫',
      t.materialCode,
      t.materialName,
      t.quantity,
      t.unit,
      t.balance,
      t.remarks || ''
    ])
    exportToCSV([headers, ...rows], '入出庫履歴.csv')
  }

  const exportHistoryToExcel = () => {
    const data = transactions.map(t => ({
      '日付': t.date,
      '種別': t.type === 'in' ? '入庫' : '出庫',
      '材料コード': t.materialCode,
      '材料名': t.materialName,
      '数量': t.quantity,
      '単位': t.unit,
      '在庫残': t.balance,
      '備考': t.remarks || ''
    }))
    exportToExcel(data, '入出庫履歴', '入出庫履歴.xlsx')
  }

  // フィルタ済みデータ
  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.code.toLowerCase().includes(materialFilter.search.toLowerCase()) ||
                         m.name.toLowerCase().includes(materialFilter.search.toLowerCase())
    const matchesWarehouse = !materialFilter.warehouse || m.warehouse === materialFilter.warehouse
    return matchesSearch && matchesWarehouse
  })

  const filteredInventory = materials.filter(m => {
    const stock = inventory[m.code]?.quantity || 0
    const status = stock === 0 ? 'out-of-stock' : stock <= m.minStock ? 'low-stock' : 'in-stock'

    const matchesSearch = m.code.toLowerCase().includes(inventoryFilter.search.toLowerCase()) ||
                         m.name.toLowerCase().includes(inventoryFilter.search.toLowerCase())
    const matchesStock = !inventoryFilter.stock || status === inventoryFilter.stock
    const matchesWarehouse = !inventoryFilter.warehouse || m.warehouse === inventoryFilter.warehouse
    return matchesSearch && matchesStock && matchesWarehouse
  })

  const filteredHistory = transactions.filter(t => {
    const matchesDateFrom = !historyFilter.dateFrom || t.date >= historyFilter.dateFrom
    const matchesDateTo = !historyFilter.dateTo || t.date <= historyFilter.dateTo
    const matchesMaterial = !historyFilter.material || t.materialCode === historyFilter.material
    const matchesType = !historyFilter.type || t.type === historyFilter.type
    return matchesDateFrom && matchesDateTo && matchesMaterial && matchesType
  }).sort((a, b) => new Date(b.date) - new Date(a.date))

  // 統計データ
  const stats = {
    total: materials.length,
    lowStock: materials.filter(m => {
      const stock = inventory[m.code]?.quantity || 0
      return stock <= m.minStock && stock > 0
    }).length,
    outOfStock: materials.filter(m => {
      const stock = inventory[m.code]?.quantity || 0
      return stock === 0
    }).length
  }

  // グラフデータ
  const getStockTrendData = () => {
    const days = 30
    const dates = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      dates.push(date.toISOString().split('T')[0])
    }

    const topMaterials = materials.slice(0, 5)
    const colors = [
      'rgb(102, 126, 234)',
      'rgb(16, 185, 129)',
      'rgb(245, 158, 11)',
      'rgb(239, 68, 68)',
      'rgb(59, 130, 246)'
    ]

    const datasets = topMaterials.map((material, index) => {
      const data = dates.map(date => {
        const trans = transactions.filter(t =>
          t.materialCode === material.code && t.date <= date
        )
        return trans.length > 0 ? trans[trans.length - 1].balance : 0
      })

      return {
        label: material.name,
        data: data,
        borderColor: colors[index],
        backgroundColor: colors[index].replace('rgb', 'rgba').replace(')', ', 0.1)'),
        tension: 0.4
      }
    })

    return { labels: dates, datasets }
  }

  const getMaterialStockData = () => {
    const labels = materials.map(m => m.name)
    const data = materials.map(m => inventory[m.code]?.quantity || 0)
    const minStocks = materials.map(m => m.minStock)

    return {
      labels,
      datasets: [
        {
          label: '現在庫',
          data: data,
          backgroundColor: 'rgba(102, 126, 234, 0.8)',
          borderColor: 'rgb(102, 126, 234)',
          borderWidth: 2
        },
        {
          label: '最低在庫数',
          data: minStocks,
          backgroundColor: 'rgba(239, 68, 68, 0.3)',
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 2,
          type: 'line'
        }
      ]
    }
  }

  return (
    <>
      <div className="alerts-container">
        {alerts.slice(0, 5).map((alert, index) => (
          <div key={index} className={`alert ${alert.type}`}>
            {alert.type === 'critical' ? '🔴' : alert.type === 'warning' ? '⚠️' : '✓'} {alert.message}
          </div>
        ))}
      </div>

      <div className="header">
        <h1>📦 材料在庫管理システム</h1>
        <p>在庫の入出庫管理、在庫推移分析、アラート通知を一元管理</p>
      </div>

      <div className="tabs">
        {[
          { id: 'dashboard', label: '📊 ダッシュボード' },
          { id: 'materials', label: '📝 材料マスタ' },
          { id: 'receiving', label: '📥 入庫管理' },
          { id: 'shipping', label: '📤 出庫管理' },
          { id: 'inventory', label: '📋 在庫照会' },
          { id: 'history', label: '📜 履歴' }
        ].map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ダッシュボード */}
      {activeTab === 'dashboard' && (
        <>
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">登録材料数</div>
            </div>
            <div className="stat-card success">
              <div className="stat-value">{stats.total - stats.lowStock - stats.outOfStock}</div>
              <div className="stat-label">在庫正常</div>
            </div>
            <div className="stat-card warning">
              <div className="stat-value">{stats.lowStock}</div>
              <div className="stat-label">在庫僅少</div>
            </div>
            <div className="stat-card danger">
              <div className="stat-value">{stats.outOfStock}</div>
              <div className="stat-label">在庫切れ</div>
            </div>
          </div>

          <div className="card">
            <h2>在庫アラート</h2>
            {alerts.filter(a => a.type !== 'success').length === 0 ? (
              <p style={{ color: '#10b981', fontWeight: 600 }}>✓ 現在、在庫アラートはありません</p>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>レベル</th>
                      <th>メッセージ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.filter(a => a.type !== 'success').map((alert, index) => (
                      <tr key={index}>
                        <td>
                          <span className={`badge ${alert.type === 'critical' ? 'out-of-stock' : 'low-stock'}`}>
                            {alert.type === 'critical' ? '在庫切れ' : '在庫僅少'}
                          </span>
                        </td>
                        <td>{alert.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card">
            <h2>在庫推移グラフ（直近30日）</h2>
            <div className="chart-container">
              <Line data={getStockTrendData()} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="card">
            <h2>材料別在庫状況</h2>
            <div className="chart-container">
              <Bar data={getMaterialStockData()} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </>
      )}

      {/* 材料マスタ */}
      {activeTab === 'materials' && (
        <>
          <div className="card">
            <h2>材料マスタ登録</h2>
            <form onSubmit={saveMaterial}>
              <div className="form-grid">
                <div className="form-group">
                  <label>材料コード *</label>
                  <input
                    type="text"
                    value={materialForm.code}
                    onChange={(e) => setMaterialForm({ ...materialForm, code: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>材料名 *</label>
                  <input
                    type="text"
                    value={materialForm.name}
                    onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>規格</label>
                  <input
                    type="text"
                    value={materialForm.spec}
                    onChange={(e) => setMaterialForm({ ...materialForm, spec: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>単位 *</label>
                  <select
                    value={materialForm.unit}
                    onChange={(e) => setMaterialForm({ ...materialForm, unit: e.target.value })}
                    required
                  >
                    <option value="個">個</option>
                    <option value="kg">kg</option>
                    <option value="本">本</option>
                    <option value="m">m</option>
                    <option value="L">L</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>最低在庫数 *</label>
                  <input
                    type="number"
                    value={materialForm.minStock}
                    onChange={(e) => setMaterialForm({ ...materialForm, minStock: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label>適正在庫数</label>
                  <input
                    type="number"
                    value={materialForm.optimalStock}
                    onChange={(e) => setMaterialForm({ ...materialForm, optimalStock: e.target.value })}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label>倉庫</label>
                  <select
                    value={materialForm.warehouse}
                    onChange={(e) => setMaterialForm({ ...materialForm, warehouse: e.target.value })}
                  >
                    <option value="第1倉庫">第1倉庫</option>
                    <option value="第2倉庫">第2倉庫</option>
                    <option value="第3倉庫">第3倉庫</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>棚番号</label>
                  <input
                    type="text"
                    value={materialForm.shelfNumber}
                    onChange={(e) => setMaterialForm({ ...materialForm, shelfNumber: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>備考</label>
                <textarea
                  value={materialForm.remarks}
                  onChange={(e) => setMaterialForm({ ...materialForm, remarks: e.target.value })}
                  rows="3"
                />
              </div>
              <button type="submit" className="btn btn-primary">登録</button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setMaterialForm({
                  code: '',
                  name: '',
                  spec: '',
                  unit: '個',
                  minStock: '',
                  optimalStock: '',
                  warehouse: '第1倉庫',
                  shelfNumber: '',
                  remarks: ''
                })}
              >
                クリア
              </button>
            </form>
          </div>

          <div className="card">
            <h2>材料一覧</h2>
            <div className="filter-bar">
              <input
                type="text"
                placeholder="材料コード・材料名で検索"
                value={materialFilter.search}
                onChange={(e) => setMaterialFilter({ ...materialFilter, search: e.target.value })}
              />
              <select
                value={materialFilter.warehouse}
                onChange={(e) => setMaterialFilter({ ...materialFilter, warehouse: e.target.value })}
              >
                <option value="">全ての倉庫</option>
                <option value="第1倉庫">第1倉庫</option>
                <option value="第2倉庫">第2倉庫</option>
                <option value="第3倉庫">第3倉庫</option>
              </select>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>材料コード</th>
                    <th>材料名</th>
                    <th>規格</th>
                    <th>単位</th>
                    <th>最低在庫数</th>
                    <th>適正在庫数</th>
                    <th>倉庫</th>
                    <th>棚番号</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMaterials.map(material => (
                    <tr key={material.id}>
                      <td>{material.code}</td>
                      <td>{material.name}</td>
                      <td>{material.spec}</td>
                      <td>{material.unit}</td>
                      <td>{material.minStock}</td>
                      <td>{material.optimalStock || '-'}</td>
                      <td>{material.warehouse}</td>
                      <td>{material.shelfNumber}</td>
                      <td>
                        <div className="action-btns">
                          <button className="action-btn delete" onClick={() => deleteMaterial(material.id)}>
                            削除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* 入庫管理 */}
      {activeTab === 'receiving' && (
        <div className="card">
          <h2>入庫登録</h2>
          <form onSubmit={saveReceiving}>
            <div className="form-grid">
              <div className="form-group">
                <label>材料 *</label>
                <select
                  value={receivingForm.materialCode}
                  onChange={(e) => setReceivingForm({ ...receivingForm, materialCode: e.target.value })}
                  required
                >
                  <option value="">選択してください</option>
                  {materials.map(m => (
                    <option key={m.code} value={m.code}>{m.code} - {m.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>入庫日 *</label>
                <input
                  type="date"
                  value={receivingForm.date}
                  onChange={(e) => setReceivingForm({ ...receivingForm, date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>入庫数量 *</label>
                <input
                  type="number"
                  value={receivingForm.quantity}
                  onChange={(e) => setReceivingForm({ ...receivingForm, quantity: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>ロットNO</label>
                <input
                  type="text"
                  value={receivingForm.lot}
                  onChange={(e) => setReceivingForm({ ...receivingForm, lot: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>仕入先</label>
                <input
                  type="text"
                  value={receivingForm.supplier}
                  onChange={(e) => setReceivingForm({ ...receivingForm, supplier: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>備考</label>
              <textarea
                value={receivingForm.remarks}
                onChange={(e) => setReceivingForm({ ...receivingForm, remarks: e.target.value })}
                rows="3"
              />
            </div>
            <button type="submit" className="btn btn-success">入庫登録</button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setReceivingForm({
                materialCode: '',
                date: new Date().toISOString().split('T')[0],
                quantity: '',
                lot: '',
                supplier: '',
                remarks: ''
              })}
            >
              クリア
            </button>
          </form>
        </div>
      )}

      {/* 出庫管理 */}
      {activeTab === 'shipping' && (
        <div className="card">
          <h2>出庫登録</h2>
          <form onSubmit={saveShipping}>
            <div className="form-grid">
              <div className="form-group">
                <label>材料 *</label>
                <select
                  value={shippingForm.materialCode}
                  onChange={(e) => setShippingForm({ ...shippingForm, materialCode: e.target.value })}
                  required
                >
                  <option value="">選択してください</option>
                  {materials.map(m => (
                    <option key={m.code} value={m.code}>{m.code} - {m.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>出庫日 *</label>
                <input
                  type="date"
                  value={shippingForm.date}
                  onChange={(e) => setShippingForm({ ...shippingForm, date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>出庫数量 *</label>
                <input
                  type="number"
                  value={shippingForm.quantity}
                  onChange={(e) => setShippingForm({ ...shippingForm, quantity: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>使用先</label>
                <input
                  type="text"
                  value={shippingForm.destination}
                  onChange={(e) => setShippingForm({ ...shippingForm, destination: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>工番</label>
                <input
                  type="text"
                  value={shippingForm.jobNumber}
                  onChange={(e) => setShippingForm({ ...shippingForm, jobNumber: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>備考</label>
              <textarea
                value={shippingForm.remarks}
                onChange={(e) => setShippingForm({ ...shippingForm, remarks: e.target.value })}
                rows="3"
              />
            </div>
            <button type="submit" className="btn btn-success">出庫登録</button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShippingForm({
                materialCode: '',
                date: new Date().toISOString().split('T')[0],
                quantity: '',
                destination: '',
                jobNumber: '',
                remarks: ''
              })}
            >
              クリア
            </button>
          </form>
        </div>
      )}

      {/* 在庫照会 */}
      {activeTab === 'inventory' && (
        <div className="card">
          <h2>現在の在庫状況</h2>
          <div className="export-buttons">
            <button className="btn btn-primary" onClick={exportInventoryToCSV}>CSV出力</button>
            <button className="btn btn-primary" onClick={exportInventoryToExcel}>Excel出力</button>
          </div>
          <div className="filter-bar">
            <input
              type="text"
              placeholder="材料コード・材料名で検索"
              value={inventoryFilter.search}
              onChange={(e) => setInventoryFilter({ ...inventoryFilter, search: e.target.value })}
            />
            <select
              value={inventoryFilter.stock}
              onChange={(e) => setInventoryFilter({ ...inventoryFilter, stock: e.target.value })}
            >
              <option value="">全て</option>
              <option value="in-stock">在庫あり</option>
              <option value="low-stock">在庫僅少</option>
              <option value="out-of-stock">在庫切れ</option>
            </select>
            <select
              value={inventoryFilter.warehouse}
              onChange={(e) => setInventoryFilter({ ...inventoryFilter, warehouse: e.target.value })}
            >
              <option value="">全ての倉庫</option>
              <option value="第1倉庫">第1倉庫</option>
              <option value="第2倉庫">第2倉庫</option>
              <option value="第3倉庫">第3倉庫</option>
            </select>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>材料コード</th>
                  <th>材料名</th>
                  <th>現在庫数</th>
                  <th>単位</th>
                  <th>最低在庫数</th>
                  <th>適正在庫数</th>
                  <th>状態</th>
                  <th>倉庫</th>
                  <th>棚番号</th>
                  <th>最終更新</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map(m => {
                  const stock = inventory[m.code]?.quantity || 0
                  const status = stock === 0 ? 'out-of-stock' : stock <= m.minStock ? 'low-stock' : 'in-stock'
                  const statusLabel = status === 'out-of-stock' ? '在庫切れ' : status === 'low-stock' ? '在庫僅少' : '在庫あり'
                  const lastUpdated = inventory[m.code]?.lastUpdated

                  return (
                    <tr key={m.code}>
                      <td>{m.code}</td>
                      <td>{m.name}</td>
                      <td style={{ fontWeight: 600 }}>{stock}</td>
                      <td>{m.unit}</td>
                      <td>{m.minStock}</td>
                      <td>{m.optimalStock || '-'}</td>
                      <td><span className={`badge ${status}`}>{statusLabel}</span></td>
                      <td>{m.warehouse}</td>
                      <td>{m.shelfNumber}</td>
                      <td>{lastUpdated ? new Date(lastUpdated).toLocaleString('ja-JP') : '-'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 履歴 */}
      {activeTab === 'history' && (
        <div className="card">
          <h2>入出庫履歴</h2>
          <div className="export-buttons">
            <button className="btn btn-primary" onClick={exportHistoryToCSV}>CSV出力</button>
            <button className="btn btn-primary" onClick={exportHistoryToExcel}>Excel出力</button>
          </div>
          <div className="filter-bar">
            <input
              type="date"
              value={historyFilter.dateFrom}
              onChange={(e) => setHistoryFilter({ ...historyFilter, dateFrom: e.target.value })}
            />
            <input
              type="date"
              value={historyFilter.dateTo}
              onChange={(e) => setHistoryFilter({ ...historyFilter, dateTo: e.target.value })}
            />
            <select
              value={historyFilter.material}
              onChange={(e) => setHistoryFilter({ ...historyFilter, material: e.target.value })}
            >
              <option value="">全ての材料</option>
              {materials.map(m => (
                <option key={m.code} value={m.code}>{m.code} - {m.name}</option>
              ))}
            </select>
            <select
              value={historyFilter.type}
              onChange={(e) => setHistoryFilter({ ...historyFilter, type: e.target.value })}
            >
              <option value="">全ての種別</option>
              <option value="in">入庫</option>
              <option value="out">出庫</option>
            </select>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>日付</th>
                  <th>種別</th>
                  <th>材料コード</th>
                  <th>材料名</th>
                  <th>数量</th>
                  <th>単位</th>
                  <th>在庫残</th>
                  <th>備考</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map(t => (
                  <tr key={t.id}>
                    <td>{t.date}</td>
                    <td><span className={`history-type ${t.type}`}>{t.type === 'in' ? '入庫' : '出庫'}</span></td>
                    <td>{t.materialCode}</td>
                    <td>{t.materialName}</td>
                    <td style={{ fontWeight: 600 }}>{t.quantity}</td>
                    <td>{t.unit}</td>
                    <td>{t.balance}</td>
                    <td>{t.remarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}

export default App
