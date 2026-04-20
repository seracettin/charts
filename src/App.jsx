import { useEffect, useMemo, useState } from 'react'
import GanttChart from './components/GanttChart.jsx'
import RowModal from './components/RowModal.jsx'
import ColumnsModal from './components/ColumnsModal.jsx'

const STORAGE_KEY = 'ubuntu-gantt-v1'

const DEFAULT_STATE = {
  title: 'Ubuntu Release Support Timeline',
  subtitle: 'An example project plan — edit rows, columns, and colors to fit your own timeline.',
  columns: ['Apr 2024', 'Oct 2024', 'Apr 2025', 'Oct 2025', 'Apr 2026', 'Oct 2026', 'Apr 2027'],
  rows: [
    { id: 'r1', name: 'Ubuntu 24.04 LTS', startCol: 'Apr 2024', endCol: 'Apr 2027', color: '#E95420', note: 'Standard support window' },
    { id: 'r2', name: 'Ubuntu 24.10',     startCol: 'Oct 2024', endCol: 'Apr 2025', color: '#77216F', note: 'Interim release' },
    { id: 'r3', name: 'Ubuntu 25.04',     startCol: 'Apr 2025', endCol: 'Oct 2025', color: '#0E8420', note: 'Interim release' },
    { id: 'r4', name: 'Ubuntu 25.10',     startCol: 'Oct 2025', endCol: 'Apr 2026', color: '#335280', note: 'Interim release' },
    { id: 'r5', name: 'Ubuntu 26.04 LTS', startCol: 'Apr 2026', endCol: 'Apr 2027', color: '#E95420', note: 'Next LTS release' }
  ]
}

function loadState () {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE
    const parsed = JSON.parse(raw)
    if (!parsed.columns || !parsed.rows) return DEFAULT_STATE
    return { ...DEFAULT_STATE, ...parsed }
  } catch {
    return DEFAULT_STATE
  }
}

const STATUS_FRESH = 'fresh'
const STATUS_SAVING = 'saving'
const STATUS_SAVED = 'saved'

export default function App () {
  const [state, setState] = useState(loadState)
  const [saveStatus, setSaveStatus] = useState(STATUS_FRESH)
  const [rowModal, setRowModal] = useState({ open: false, row: null })
  const [colModalOpen, setColModalOpen] = useState(false)

  useEffect(() => {
    setSaveStatus(STATUS_SAVING)
    const t = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
        setSaveStatus(STATUS_SAVED)
      } catch {
        setSaveStatus(STATUS_FRESH)
      }
    }, 250)
    return () => clearTimeout(t)
  }, [state])

  const openAddRow = () => setRowModal({ open: true, row: null })
  const openEditRow = (row) => setRowModal({ open: true, row })
  const closeRowModal = () => setRowModal({ open: false, row: null })

  const saveRow = (row) => {
    setState(prev => {
      const exists = prev.rows.some(r => r.id === row.id)
      const rows = exists
        ? prev.rows.map(r => (r.id === row.id ? row : r))
        : [...prev.rows, row]
      return { ...prev, rows }
    })
    closeRowModal()
  }

  const deleteRow = (id) => {
    setState(prev => ({ ...prev, rows: prev.rows.filter(r => r.id !== id) }))
    closeRowModal()
  }

  const saveColumns = (columns) => {
    setState(prev => {
      const valid = new Set(columns)
      const rows = prev.rows.map(r => ({
        ...r,
        startCol: valid.has(r.startCol) ? r.startCol : columns[0],
        endCol: valid.has(r.endCol) ? r.endCol : columns[columns.length - 1]
      }))
      return { ...prev, columns, rows }
    })
    setColModalOpen(false)
  }

  const resetAll = () => {
    if (confirm('Reset all data to the example timeline?')) {
      setState(DEFAULT_STATE)
    }
  }

  const updateMeta = (patch) => setState(prev => ({ ...prev, ...patch }))

  const statusLabel = useMemo(() => ({
    [STATUS_FRESH]: 'Ready',
    [STATUS_SAVING]: 'Saving…',
    [STATUS_SAVED]: 'Saved to this browser'
  })[saveStatus], [saveStatus])

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <span className="brand-dot" />
          <span className="brand-text">gantt<span>.studio</span></span>
        </div>
        <div className="topbar-actions">
          <span className={`save-pill save-${saveStatus}`}>{statusLabel}</span>
          <button className="btn btn-ghost" onClick={resetAll}>Reset</button>
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <div className="hero-text">
            <input
              className="hero-title"
              value={state.title}
              onChange={e => updateMeta({ title: e.target.value })}
              aria-label="Chart title"
            />
            <input
              className="hero-sub"
              value={state.subtitle}
              onChange={e => updateMeta({ subtitle: e.target.value })}
              aria-label="Chart subtitle"
            />
          </div>
          <div className="hero-actions">
            <button className="btn btn-secondary" onClick={() => setColModalOpen(true)}>
              Edit columns
            </button>
            <button className="btn btn-primary" onClick={openAddRow}>
              + New row
            </button>
          </div>
        </section>

        <GanttChart
          columns={state.columns}
          rows={state.rows}
          onEditRow={openEditRow}
        />

        <footer className="footnote">
          Inspired by the Ubuntu Desktop release schedule. Rows and columns are fully editable — use any
          labels you like (months, quarters, sprints, phases). Your data is saved to this browser only.
        </footer>
      </main>

      {rowModal.open && (
        <RowModal
          row={rowModal.row}
          columns={state.columns}
          onSave={saveRow}
          onDelete={deleteRow}
          onClose={closeRowModal}
        />
      )}

      {colModalOpen && (
        <ColumnsModal
          columns={state.columns}
          onSave={saveColumns}
          onClose={() => setColModalOpen(false)}
        />
      )}
    </div>
  )
}
