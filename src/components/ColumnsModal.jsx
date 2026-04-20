import { useState } from 'react'
import Modal from './Modal.jsx'

export default function ColumnsModal ({ columns, onSave, onClose }) {
  const [items, setItems] = useState(columns.length ? [...columns] : [''])
  const [error, setError] = useState('')

  const update = (i, value) => setItems(arr => arr.map((v, idx) => (idx === i ? value : v)))
  const remove = (i) => setItems(arr => arr.filter((_, idx) => idx !== i))
  const add = () => setItems(arr => [...arr, ''])
  const move = (i, dir) => setItems(arr => {
    const j = i + dir
    if (j < 0 || j >= arr.length) return arr
    const copy = [...arr]
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
    return copy
  })

  const submit = (e) => {
    e.preventDefault()
    const cleaned = items.map(s => s.trim()).filter(Boolean)
    if (cleaned.length < 1) return setError('Add at least one column.')
    const unique = new Set(cleaned)
    if (unique.size !== cleaned.length) return setError('Column labels must be unique.')
    setError('')
    onSave(cleaned)
  }

  return (
    <Modal
      title="Edit columns"
      subtitle="Columns can be anything — months, sprints, phases, rooms. Drag-free reorder with the arrows."
      onClose={onClose}
      footer={
        <div className="modal-actions">
          <div className="spacer" />
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" form="cols-form" className="btn btn-primary">Save columns</button>
        </div>
      }
    >
      <form id="cols-form" className="form" onSubmit={submit}>
        <div className="col-list">
          {items.map((val, i) => (
            <div className="col-row" key={i}>
              <span className="col-index">{i + 1}</span>
              <input
                className="input"
                value={val}
                onChange={e => update(i, e.target.value)}
                placeholder="Column label (e.g. Jan 2026, Sprint 4, Phase II)"
              />
              <div className="col-row-actions">
                <button type="button" className="icon-btn" onClick={() => move(i, -1)} aria-label="Move up">↑</button>
                <button type="button" className="icon-btn" onClick={() => move(i, 1)} aria-label="Move down">↓</button>
                <button type="button" className="icon-btn danger" onClick={() => remove(i)} aria-label="Remove">×</button>
              </div>
            </div>
          ))}
        </div>

        <button type="button" className="btn btn-secondary" onClick={add}>+ Add column</button>

        {error && <p className="form-error">{error}</p>}
      </form>
    </Modal>
  )
}
