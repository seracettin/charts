import { useState } from 'react'
import Modal from './Modal.jsx'

const PALETTE = ['#E95420', '#77216F', '#0E8420', '#335280', '#19B6EE', '#F99B11', '#111111']

function newId () {
  return 'r_' + Math.random().toString(36).slice(2, 10)
}

export default function RowModal ({ row, columns, onSave, onDelete, onClose }) {
  const isEdit = !!row
  const [form, setForm] = useState(() => ({
    id: row?.id ?? newId(),
    name: row?.name ?? '',
    startCol: row?.startCol ?? columns[0] ?? '',
    endCol: row?.endCol ?? columns[columns.length - 1] ?? '',
    color: row?.color ?? PALETTE[0],
    note: row?.note ?? ''
  }))
  const [error, setError] = useState('')

  const update = (patch) => setForm(f => ({ ...f, ...patch }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return setError('Row label is required.')
    if (!form.startCol || !form.endCol) return setError('Pick a start and end column.')
    const si = columns.indexOf(form.startCol)
    const ei = columns.indexOf(form.endCol)
    if (si < 0 || ei < 0) return setError('Invalid column.')
    if (ei < si) return setError('End column must be after start column.')
    setError('')
    onSave({ ...form, name: form.name.trim(), note: form.note.trim() })
  }

  return (
    <Modal
      title={isEdit ? 'Edit row' : 'Add a new row'}
      subtitle="Row labels, spans, and colors are all up to you."
      onClose={onClose}
      footer={
        <div className="modal-actions">
          {isEdit && (
            <button type="button" className="btn btn-danger" onClick={() => onDelete(form.id)}>
              Delete
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
            placeholder="e.g. Ubuntu 26.04 LTS, Design Sprint, Backend API…"
          />
        </label>

        <div className="field-row">
          <label className="field">
            <span className="field-label">Start column</span>
            <select
              className="input"
              value={form.startCol}
              onChange={e => update({ startCol: e.target.value })}
            >
              {columns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="field">
            <span className="field-label">End column</span>
            <select
              className="input"
              value={form.endCol}
              onChange={e => update({ endCol: e.target.value })}
            >
              {columns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>

        <label className="field">
          <span className="field-label">Note (optional)</span>
          <input
            className="input"
            value={form.note}
            onChange={e => update({ note: e.target.value })}
            placeholder="Short description shown next to the row label"
          />
        </label>

        <div className="field">
          <span className="field-label">Color</span>
          <div className="swatches">
            {PALETTE.map(c => (
              <button
                key={c}
                type="button"
                className={`swatch ${form.color === c ? 'is-active' : ''}`}
                style={{ background: c }}
                onClick={() => update({ color: c })}
                aria-label={`Pick color ${c}`}
              />
            ))}
            <label className="swatch-custom">
              <input
                type="color"
                value={form.color}
                onChange={e => update({ color: e.target.value })}
              />
              <span>Custom</span>
            </label>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}
      </form>
    </Modal>
  )
}
