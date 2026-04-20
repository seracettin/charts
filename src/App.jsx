import { useEffect, useMemo, useState } from 'react'
import GanttChart from './components/GanttChart.jsx'
import RowModal from './components/RowModal.jsx'
import ColumnsModal from './components/ColumnsModal.jsx'
import { PALETTE } from './constants.js'

const STORAGE_KEY = 'ubuntu-gantt-v2'
const LEGACY_KEY  = 'ubuntu-gantt-v1'

const DEFAULT_STATE = {
  title: 'Ubuntu release lifecycle',
  subtitle: 'Inspired by the Ubuntu Desktop release schedule — each LTS row carries multiple support phases.',
  columns: ['2020', '2022', '2024', '2026', '2028', '2030', '2032', '2034', '2036'],
  rows: [
    {
      id: 'r-2404',
      name: 'Ubuntu 24.04 LTS',
      note: 'Noble Numbat',
      segments: [
        { id: 's1', label: 'Standard support',  startCol: '2024', endCol: '2028', color: PALETTE.orange },
        { id: 's2', label: 'Ubuntu Pro (ESM)',  startCol: '2028', endCol: '2034', color: PALETTE.aubergine },
        { id: 's3', label: 'Legacy add-on',     startCol: '2034', endCol: '2036', color: PALETTE.aubergineLight }
      ]
    },
    {
      id: 'r-2204',
      name: 'Ubuntu 22.04 LTS',
      note: 'Jammy Jellyfish',
      segments: [
        { id: 's1', label: 'Standard support',  startCol: '2022', endCol: '2026', color: PALETTE.orange },
        { id: 's2', label: 'Ubuntu Pro (ESM)',  startCol: '2026', endCol: '2032', color: PALETTE.aubergine },
        { id: 's3', label: 'Legacy add-on',     startCol: '2032', endCol: '2034', color: PALETTE.aubergineLight }
      ]
    },
    {
      id: 'r-2004',
      name: 'Ubuntu 20.04 LTS',
      note: 'Focal Fossa',
      segments: [
        { id: 's1', label: 'Standard support',  startCol: '2020', endCol: '2024', color: PALETTE.orange },
        { id: 's2', label: 'Ubuntu Pro (ESM)',  startCol: '2024', endCol: '2030', color: PALETTE.aubergine },
        { id: 's3', label: 'Legacy add-on',     startCol: '2030', endCol: '2032', color: PALETTE.aubergineLight }
      ]
    },
    {
      id: 'r-interim',
      name: 'Ubuntu 24.10 / 25.04 / 25.10',
      note: 'Interim releases — 9 months each',
      segments: [
        { id: 's1', label: '24.10', startCol: '2024', endCol: '2026', color: PALETTE.purple },
        { id: 's2', label: '25.04', startCol: '2026', endCol: '2026', color: PALETTE.teal },
        { id: 's3', label: '25.10', startCol: '2026', endCol: '2028', color: PALETTE.blue }
      ]
    }
  ]
}

function migrate (data) {
  if (!data || !data.rows || !data.columns) return DEFAULT_STATE
  const rows = data.rows.map(r => {
    if (Array.isArray(r.segments) && r.segments.length) return r
    return {
      id: r.id,
      name: r.name,
      note: r.note ?? '',
      segments: [{
        id: 's1',
        label: r.note || 'Phase',
        startCol: r.startCol,
        endCol: r.endCol,
        color: r.color || PALETTE.orange
      }]
    }
  })
  return { ...DEFAULT_STATE, ...data, rows }
}

function loadState () {
  try {
    let raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const legacy = localStorage.getItem(LEGACY_KEY)
      if (legacy) raw = legacy
    }
    if (!raw) return DEFAULT_STATE
    return migrate(JSON.parse(raw))
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
  const [rowModal, setRowModal] = useState({ open: false, row: null, focusSegmentId: null })
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

  const openAddRow = () => setRowModal({ open: true, row: null, focusSegmentId: null })
  const openEditRow = (row, focusSegmentId = null) => setRowModal({ open: true, row, focusSegmentId })
  const closeRowModal = () => setRowModal({ open: false, row: null, focusSegmentId: null })

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
      const fallbackStart = columns[0]
      const fallbackEnd = columns[columns.length - 1]
      const rows = prev.rows.map(r => ({
        ...r,
        segments: r.segments.map(s => ({
          ...s,
          startCol: valid.has(s.startCol) ? s.startCol : fallbackStart,
          endCol: valid.has(s.endCol) ? s.endCol : fallbackEnd
        }))
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

  const legend = useMemo(() => {
    const seen = new Map()
    state.rows.forEach(r => r.segments.forEach(s => {
      const key = `${s.label}::${s.color}`
      if (!seen.has(key)) seen.set(key, { label: s.label, color: s.color })
    }))
    return Array.from(seen.values()).slice(0, 8)
  }, [state.rows])

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

        {legend.length > 0 && (
          <div className="legend" aria-label="Legend">
            {legend.map((l, i) => (
              <span key={i} className="legend-item">
                <span className="legend-dot" style={{ background: l.color }} />
                {l.label || 'Phase'}
              </span>
            ))}
          </div>
        )}

        <GanttChart
          columns={state.columns}
          rows={state.rows}
          onEditRow={openEditRow}
        />

        <footer className="footnote">
          Inspired by the Ubuntu Desktop release schedule. Each row can carry multiple phase segments
          (Standard support, Ubuntu Pro, Legacy add-on…) — click any bar or row label to edit. Your
          data is saved to this browser only.
        </footer>
      </main>

      {rowModal.open && (
        <RowModal
          row={rowModal.row}
          focusSegmentId={rowModal.focusSegmentId}
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
