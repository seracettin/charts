import { useState } from 'react'
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

export default function RowModal ({ row, columns, onSave, onDelete, onClose }) {
  const isEdit = !!row
  const [form, setForm] = useState(() => ({
    id: row?.id ?? newId('r'),
    name: row?.name ?? '',
    note: row?.note ?? '',
    segments: row?.segments?.length
      ? row.segments.map(s => ({ ...s, id: s.id ?? newId('s') }))
      : [emptySegment(columns)]
  }))
  const [error, setError] = useState('')

  const update = (patch) => setForm(f => ({ ...f, ...patch }))
  const updateSeg = (i, patch) =>
    setForm(f => ({ ...f, segments: f.segments.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) }))
  const addSeg = () =>
    setForm(f => ({ ...f, segments: [...f.segments, emptySegment(columns, pickNextColor(f.segments))] }))
  const removeSeg = (i) =>
    setForm(f => ({ ...f, segments: f.segments.filter((_, idx) => idx !== i) }))

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

  return (
    <Modal
      title={isEdit ? 'Edit row' : 'Add a new row'}
      subtitle="A row can carry multiple phase segments — e.g. Standard support, Pro, Legacy."
      onClose={onClose}
      footer={
        <div className="modal-actions">
          {isEdit && (
            <button type="button" className="btn btn-danger" onClick={() => onDelete(form.id)}>
              Delete row
            </button>
          )}
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
            autoFocus
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
            <span className="field-label">Phase segments</span>
            <button type="button" className="btn btn-secondary btn-sm" onClick={addSeg}>+ Add segment</button>
          </div>

          <div className="seg-list">
            {form.segments.map((s, i) => (
              <div key={s.id} className="seg-card" style={{ borderLeftColor: s.color }}>
                <div className="seg-row">
                  <label className="field flex-1">
                    <span className="field-label">Label</span>
                    <input
                      className="input"
                      value={s.label}
                      onChange={e => updateSeg(i, { label: e.target.value })}
                      placeholder="e.g. Standard support, Ubuntu Pro, Legacy add-on"
                    />
                  </label>
                  <button
                    type="button"
                    className="icon-btn danger"
                    onClick={() => removeSeg(i)}
                    aria-label="Remove segment"
                    disabled={form.segments.length === 1}
                    title={form.segments.length === 1 ? 'At least one segment is required' : 'Remove segment'}
                  >×</button>
                </div>
                <div className="seg-row">
                  <label className="field flex-1">
                    <span className="field-label">Start column</span>
                    <select
                      className="input"
                      value={s.startCol}
                      onChange={e => updateSeg(i, { startCol: e.target.value })}
                    >
                      {columns.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </label>
                  <label className="field flex-1">
                    <span className="field-label">End column</span>
                    <select
                      className="input"
                      value={s.endCol}
                      onChange={e => updateSeg(i, { endCol: e.target.value })}
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
                        className={`swatch ${s.color === c ? 'is-active' : ''}`}
                        style={{ background: c }}
                        onClick={() => updateSeg(i, { color: c })}
                        aria-label={`Pick color ${c}`}
                      />
                    ))}
                    <label className="swatch-custom">
                      <input
                        type="color"
                        value={s.color}
                        onChange={e => updateSeg(i, { color: e.target.value })}
                      />
                      <span>Custom</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}
      </form>
    </Modal>
  )
}

function pickNextColor (existing) {
  const used = new Set(existing.map(s => s.color))
  return SWATCHES.find(c => !used.has(c)) ?? PALETTE.orange
}
