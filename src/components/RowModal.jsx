import { useMemo, useState } from 'react'
import Modal from './Modal.jsx'
import { PALETTE } from '../constants.js'

const SWATCHES = [
  PALETTE.orange, PALETTE.orangeLight,
  PALETTE.aubergine, PALETTE.aubergineLight,
  PALETTE.purple, PALETTE.blue, PALETTE.teal, PALETTE.green,
  PALETTE.warmGrey, PALETTE.coolGrey
]

function newId (prefix = 'id') {
  return `${prefix}_` + Math.random().toString(36).slice(2, 10)
}

function emptySegment (columns, color = PALETTE.orange) {
  return {
    id: newId('s'),
    label: '',
    startCol: columns[0] ?? '',
    endCol: columns[columns.length - 1] ?? '',
    color
  }
}

export default function RowModal ({ row, focusSegmentId, columns, onSave, onDelete, onClose }) {
  const isEdit = !!row
  const [form, setForm] = useState(() => ({
    id: row?.id ?? newId('r'),
    name: row?.name ?? '',
    note: row?.note ?? '',
    segments: row?.segments?.length
      ? row.segments.map(s => ({ ...s, id: s.id ?? newId('s') }))
      : [emptySegment(columns)]
  }))
  // When a specific segment was clicked, start in single-segment focus mode.
  const [focusedId, setFocusedId] = useState(focusSegmentId ?? null)
  const [error, setError] = useState('')

  const focusIndex = useMemo(
    () => (focusedId ? form.segments.findIndex(s => s.id === focusedId) : -1),
    [focusedId, form.segments]
  )
  const isFocusMode = focusedId != null && focusIndex >= 0

  const update = (patch) => setForm(f => ({ ...f, ...patch }))
  const updateSeg = (i, patch) =>
    setForm(f => ({ ...f, segments: f.segments.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) }))
  const addSeg = () =>
    setForm(f => ({ ...f, segments: [...f.segments, emptySegment(columns, pickNextColor(f.segments))] }))
  const removeSeg = (i) =>
    setForm(f => {
      const seg = f.segments[i]
      const segments = f.segments.filter((_, idx) => idx !== i)
      if (focusedId === seg.id) setFocusedId(null)
      return { ...f, segments }
    })
  const removeFocusedSegment = () => {
    if (focusIndex < 0) return
    removeSeg(focusIndex)
  }

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return setError('Row label is required.')
    if (!form.segments.length) return setError('Add at least one segment.')
    for (const [i, s] of form.segments.entries()) {
      const si = columns.indexOf(s.startCol)
      const ei = columns.indexOf(s.endCol)
      if (si < 0 || ei < 0) return setError(`Segment ${i + 1}: pick valid start and end columns.`)
      if (ei < si) return setError(`Segment ${i + 1}: end column must be at or after start.`)
    }
    setError('')
    onSave({
      ...form,
      name: form.name.trim(),
      note: form.note.trim(),
      segments: form.segments.map(s => ({ ...s, label: (s.label || '').trim() }))
    })
  }

  const focusedSeg = isFocusMode ? form.segments[focusIndex] : null

  const title = isFocusMode
    ? `Edit segment${focusedSeg?.label ? ` — ${focusedSeg.label}` : ''}`
    : isEdit ? 'Edit row' : 'Add a new row'
  const subtitle = isFocusMode
    ? `On row “${form.name || 'Untitled'}”. Changes save to this one segment only.`
    : 'A row can carry multiple phase segments — e.g. Standard support, Pro, Legacy.'

  return (
    <Modal
      title={title}
      subtitle={subtitle}
      onClose={onClose}
      footer={
        <div className="modal-actions">
          {isFocusMode ? (
            <button type="button" className="btn btn-danger" onClick={removeFocusedSegment}>
              Delete segment
            </button>
          ) : isEdit ? (
            <button type="button" className="btn btn-danger" onClick={() => onDelete(form.id)}>
              Delete row
            </button>
          ) : null}
          <div className="spacer" />
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" form="row-form" className="btn btn-primary">
            {isEdit ? 'Save changes' : 'Add row'}
          </button>
        </div>
      }
    >
      <form id="row-form" className="form" onSubmit={submit}>
        <label className="field">
          <span className="field-label">Row label</span>
          <input
            className="input"
            autoFocus={!isFocusMode}
            value={form.name}
            onChange={e => update({ name: e.target.value })}
            placeholder="e.g. Ubuntu 24.04 LTS, Design Sprint, Backend API…"
          />
        </label>

        <label className="field">
          <span className="field-label">Note (optional)</span>
          <input
            className="input"
            value={form.note}
            onChange={e => update({ note: e.target.value })}
            placeholder="Shown under the row label (e.g. Noble Numbat)"
          />
        </label>

        <div className="field">
          <div className="field-header">
            <span className="field-label">
              {isFocusMode ? 'This segment' : 'Phase segments'}
            </span>
            {isFocusMode ? (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setFocusedId(null)}>
                Manage all {form.segments.length} segment{form.segments.length === 1 ? '' : 's'}
              </button>
            ) : (
              <button type="button" className="btn btn-secondary btn-sm" onClick={addSeg}>
                + Add segment
              </button>
            )}
          </div>

          <div className="seg-list">
            {(isFocusMode ? [focusedSeg] : form.segments).map((s) => {
              const i = form.segments.indexOf(s)
              return (
                <SegmentCard
                  key={s.id}
                  seg={s}
                  columns={columns}
                  canRemove={!isFocusMode && form.segments.length > 1}
                  showRemove={!isFocusMode}
                  onChange={patch => updateSeg(i, patch)}
                  onRemove={() => removeSeg(i)}
                />
              )
            })}
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}
      </form>
    </Modal>
  )
}

function SegmentCard ({ seg, columns, canRemove, showRemove, onChange, onRemove }) {
  return (
    <div className="seg-card" style={{ borderLeftColor: seg.color }}>
      <div className="seg-row">
        <label className="field flex-1">
          <span className="field-label">Label</span>
          <input
            className="input"
            value={seg.label}
            onChange={e => onChange({ label: e.target.value })}
            placeholder="e.g. Standard support, Ubuntu Pro, Legacy add-on"
          />
        </label>
        {showRemove && (
          <button
            type="button"
            className="icon-btn danger"
            onClick={onRemove}
            aria-label="Remove segment"
            disabled={!canRemove}
            title={canRemove ? 'Remove segment' : 'At least one segment is required'}
          >×</button>
        )}
      </div>
      <div className="seg-row">
        <label className="field flex-1">
          <span className="field-label">Start column</span>
          <select
            className="input"
            value={seg.startCol}
            onChange={e => onChange({ startCol: e.target.value })}
          >
            {columns.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="field flex-1">
          <span className="field-label">End column</span>
          <select
            className="input"
            value={seg.endCol}
            onChange={e => onChange({ endCol: e.target.value })}
          >
            {columns.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
      </div>
      <div className="field">
        <span className="field-label">Color</span>
        <div className="swatches">
          {SWATCHES.map(c => (
            <button
              key={c}
              type="button"
              className={`swatch ${seg.color === c ? 'is-active' : ''}`}
              style={{ background: c }}
              onClick={() => onChange({ color: c })}
              aria-label={`Pick color ${c}`}
            />
          ))}
          <label className="swatch-custom">
            <input
              type="color"
              value={seg.color}
              onChange={e => onChange({ color: e.target.value })}
            />
            <span>Custom</span>
          </label>
        </div>
      </div>
    </div>
  )
}

function pickNextColor (existing) {
  const used = new Set(existing.map(s => s.color))
  return SWATCHES.find(c => !used.has(c)) ?? PALETTE.orange
}
