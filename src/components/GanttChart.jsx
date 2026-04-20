function clampSpan (columns, startCol, endCol) {
  const startIdx = Math.max(0, columns.indexOf(startCol))
  let endIdx = columns.indexOf(endCol)
  if (endIdx < 0) endIdx = columns.length - 1
  if (endIdx < startIdx) endIdx = startIdx
  return { startIdx, endIdx, span: endIdx - startIdx + 1 }
}

export default function GanttChart ({ columns, rows, onEditRow }) {
  if (!columns.length) {
    return (
      <div className="gantt empty">
        <p>No columns yet. Click <strong>Edit columns</strong> to add a timeline.</p>
      </div>
    )
  }

  const templateColumns = `minmax(220px, 260px) repeat(${columns.length}, minmax(110px, 1fr))`

  return (
    <div className="gantt-wrap">
      <div className="gantt" style={{ '--cols': columns.length }}>
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

          {rows.map((row, rIdx) => {
            const { startIdx, span } = clampSpan(columns, row.startCol, row.endCol)
            return (
              <RowLine
                key={row.id}
                row={row}
                rIdx={rIdx}
                columns={columns}
                startIdx={startIdx}
                span={span}
                onEditRow={onEditRow}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

function RowLine ({ row, rIdx, columns, startIdx, span, onEditRow }) {
  const zebra = rIdx % 2 === 0 ? 'row-even' : 'row-odd'
  return (
    <>
      <button
        className={`gantt-rowhead ${zebra}`}
        onClick={() => onEditRow(row)}
        title="Edit row"
      >
        <span className="rowhead-dot" style={{ background: row.color }} />
        <span className="rowhead-name">{row.name}</span>
        {row.note && <span className="rowhead-note">{row.note}</span>}
      </button>

      {columns.map((c, i) => (
        <div key={c + i} className={`gantt-cell ${zebra}`} />
      ))}

      <div
        className="gantt-bar"
        style={{
          gridColumn: `${startIdx + 2} / span ${span}`,
          gridRow: rIdx + 2,
          background: row.color
        }}
        onClick={() => onEditRow(row)}
        title={`${row.name} — ${row.startCol} → ${row.endCol}`}
      >
        <span className="gantt-bar-label">
          {row.startCol} → {row.endCol}
        </span>
      </div>
    </>
  )
}
