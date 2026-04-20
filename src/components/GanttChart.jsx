const BAR_H = 36
const LANE_GAP = 6
const ROW_PAD = 12

function clampSpan (columns, startCol, endCol) {
  let startIdx = columns.indexOf(startCol)
  let endIdx = columns.indexOf(endCol)
  if (startIdx < 0) startIdx = 0
  if (endIdx < 0) endIdx = columns.length - 1
  if (endIdx < startIdx) endIdx = startIdx
  return { startIdx, endIdx, span: endIdx - startIdx + 1 }
}

// Greedy lane packing: sort by startIdx asc (tie-break endIdx asc) and
// drop each segment into the first lane whose previous segment ends
// before this one starts. Non-overlapping segments share a lane
// (rendered side-by-side); overlapping ones stack vertically.
function layoutSegments (segments, columns) {
  const withIdx = segments.map(s => ({ seg: s, ...clampSpan(columns, s.startCol, s.endCol) }))
  withIdx.sort((a, b) => a.startIdx - b.startIdx || a.endIdx - b.endIdx)

  const laneEnds = [] // last endIdx occupied in each lane
  for (const item of withIdx) {
    let lane = laneEnds.findIndex(end => end < item.startIdx)
    if (lane === -1) {
      lane = laneEnds.length
      laneEnds.push(item.endIdx)
    } else {
      laneEnds[lane] = item.endIdx
    }
    item.lane = lane
  }

  return { items: withIdx, laneCount: Math.max(1, laneEnds.length) }
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
          <div className="gantt-head gantt-corner" style={{ gridRow: 1, gridColumn: 1 }}>
            Row / Column
          </div>
          {columns.map((c, i) => (
            <div key={c + i} className="gantt-head" style={{ gridRow: 1, gridColumn: i + 2 }}>
              {c}
            </div>
          ))}

          {rows.length === 0 && (
            <div
              className="gantt-empty-row"
              style={{ gridRow: 2, gridColumn: `1 / span ${columns.length + 1}` }}
            >
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
  const { items, laneCount } = layoutSegments(row.segments, columns)
  const rowHeight = ROW_PAD * 2 + laneCount * BAR_H + (laneCount - 1) * LANE_GAP
  const gridRow = rIdx + 2
  const zebra = rIdx % 2 === 0 ? 'row-even' : 'row-odd'
  const firstColor = row.segments[0]?.color ?? '#AEA79F'

  return (
    <>
      <button
        className={`gantt-rowhead ${zebra}`}
        style={{ gridRow, gridColumn: 1, minHeight: rowHeight }}
        onClick={() => onEditRow(row)}
        title="Edit row"
      >
        <span className="rowhead-dot" style={{ background: firstColor }} />
        <span className="rowhead-name">{row.name}</span>
        {row.note && <span className="rowhead-note">{row.note}</span>}
      </button>

      {columns.map((c, i) => (
        <div
          key={c + i}
          className={`gantt-cell ${zebra}`}
          style={{ gridRow, gridColumn: i + 2, minHeight: rowHeight }}
        />
      ))}

      {items.map(({ seg, startIdx, span, lane }) => (
        <div
          key={seg.id}
          className="gantt-bar"
          style={{
            gridRow,
            gridColumn: `${startIdx + 2} / span ${span}`,
            background: seg.color,
            height: BAR_H,
            marginTop: ROW_PAD + lane * (BAR_H + LANE_GAP)
          }}
          onClick={(e) => { e.stopPropagation(); onEditRow(row, seg.id) }}
          title={`${row.name} — ${seg.label || 'Phase'}: ${seg.startCol} → ${seg.endCol}`}
        >
          <span className="gantt-bar-label">
            {seg.label || `${seg.startCol} → ${seg.endCol}`}
          </span>
        </div>
      ))}
    </>
  )
}
