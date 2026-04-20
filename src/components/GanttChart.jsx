function clampSpan (columns, startCol, endCol) {
  let startIdx = columns.indexOf(startCol)
  let endIdx = columns.indexOf(endCol)
  if (startIdx < 0) startIdx = 0
  if (endIdx < 0) endIdx = columns.length - 1
  if (endIdx < startIdx) endIdx = startIdx
  return { startIdx, endIdx, span: endIdx - startIdx + 1 }
}

export default function GanttChart ({ columns, rows, onEditRow }) {
  if (!columns.length) {
    return (
      <div className="gantt-wrap">
        <div className="gantt empty">
          <p>No columns yet. Click <strong>Edit columns</strong> to add a timeline.</p>
        </div>
      </div>
    )
  }

  const templateColumns = `minmax(220px, 260px) repeat(${columns.length}, minmax(96px, 1fr))`

  return (
    <div className="gantt-wrap">
      <div className="gantt">
        <div className="gantt-grid" style={{ gridTemplateColumns: templateColumns }}>
          <div className="gantt-head gantt-corner">Row / Column</div>
          {columns.map((c, i) => (
            <div key={c + i} className="gantt-head">{c}</div>
          ))}

          {rows.length === 0 && (
            <div className="gantt-empty-row" style={{ gridColumn: `1 / span ${columns.length + 1}` }}>
              No rows yet. Click <strong>+ New row</strong> to start your chart.
            </div>
          )}

          {rows.map((row, rIdx) => (
            <RowLine
              key={row.id}
              row={row}
              rIdx={rIdx}
              columns={columns}
              onEditRow={onEditRow}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function RowLine ({ row, rIdx, columns, onEditRow }) {
  const zebra = rIdx % 2 === 0 ? 'row-even' : 'row-odd'
  const firstColor = row.segments[0]?.color ?? '#AEA79F'

  return (
    <>
      <button
        className={`gantt-rowhead ${zebra}`}
        onClick={() => onEditRow(row)}
        title="Edit row"
      >
        <span className="rowhead-dot" style={{ background: firstColor }} />
        <span className="rowhead-name">{row.name}</span>
        {row.note && <span className="rowhead-note">{row.note}</span>}
      </button>

      {columns.map((c, i) => (
        <div key={c + i} className={`gantt-cell ${zebra}`} />
      ))}

      {row.segments.map((seg, sIdx) => {
        const { startIdx, span } = clampSpan(columns, seg.startCol, seg.endCol)
        return (
          <div
            key={seg.id ?? sIdx}
            className="gantt-bar"
            style={{
              gridColumn: `${startIdx + 2} / span ${span}`,
              gridRow: rIdx + 2,
              background: seg.color
            }}
            onClick={() => onEditRow(row)}
            title={`${row.name} — ${seg.label || 'Phase'}: ${seg.startCol} → ${seg.endCol}`}
          >
            <span className="gantt-bar-label">
              {seg.label || `${seg.startCol} → ${seg.endCol}`}
            </span>
          </div>
        )
      })}
    </>
  )
}
