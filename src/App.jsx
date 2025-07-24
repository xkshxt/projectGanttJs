import React, { useMemo, useState, useEffect } from "react";
import "./GanttChart.css";
import initialTasksRaw from "./tasksData";

// ----- Helpers -----
function parseDate(str) {
  return new Date(str + "T00:00:00");
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function getGroupDateRange(tasks, groupId) {
  const children = tasks.filter((t) => t.parent === groupId);
  if (children.length === 0) return [null, null];
  let min = parseDate(children[0].start);
  let max = parseDate(children[0].end);
  children.forEach((t) => {
    const st = parseDate(t.start),
      en = parseDate(t.end);
    if (st < min) min = st;
    if (en > max) max = en;
  });
  return [min, max];
}

function getVisibleTasks(allTasks, groupExpandedMap) {
  let out = [];
  for (const t of allTasks) {
    if (t.isGroup) {
      out.push(t);
      if (groupExpandedMap[t.id]) {
        const children = allTasks.filter((x) => x.parent === t.id);
        out = out.concat(children);
      }
    } else if (!t.parent) {
      out.push(t);
    }
  }
  return out;
}

function buildChartColumns(tasks, zoom) {
  const tasksOnly = tasks.filter((t) => !t.isGroup);
  let min = parseDate(tasksOnly[0].start);
  let max = parseDate(tasksOnly[0].end);
  tasksOnly.forEach((t) => {
    const start = parseDate(t.start);
    const end = parseDate(t.end);
    if (start < min) min = start;
    if (end > max) max = end;
  });
  const chartColumns = [];

  if (zoom === "Day") {
    let d = new Date(min);
    while (d <= max) {
      chartColumns.push({
        date: new Date(d),
        label: d.toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
        }),
      });
      d.setDate(d.getDate() + 1);
    }
  } else if (zoom === "Week") {
    let d = new Date(min);
    d.setDate(d.getDate() - d.getDay()); // Snap to Sunday
    while (d <= max) {
      chartColumns.push({
        date: new Date(d),
        label:
          `Wk ${getWeekNumber(d)}\n` +
          d.toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
      });
      d.setDate(d.getDate() + 7);
    }
  } else if (zoom === "Month") {
    let d = new Date(min.getFullYear(), min.getMonth(), 1);
    while (d <= max) {
      chartColumns.push({
        date: new Date(d),
        label: d.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        }),
      });
      d.setMonth(d.getMonth() + 1);
    }
  }
  return chartColumns;
}

function getWeekNumber(date) {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
  return Math.ceil((diff + startOfYear.getDay() + 1) / 7);
}

const NO_DRAG = null;
// Minimum chart area width, adjust as you like:
const GANTT_MIN_WIDTH = 900;

function App() {
  // --- ZOOM STATE ---
  const [zoom, setZoom] = useState("Day"); // "Day", "Week", "Month"
  const baseColWidth = zoom === "Day" ? 40 : zoom === "Week" ? 60 : 100;

  // --- GROUP COLLAPSE ---
  const [groupExpanded, setGroupExpanded] = useState(() =>
    Object.fromEntries(
      initialTasksRaw.filter((t) => t.isGroup).map((t) => [t.id, !!t.expanded])
    )
  );
  // TASK data state:
  const [tasks, setTasks] = useState(initialTasksRaw);
  const [dragInfo, setDragInfo] = useState(NO_DRAG);

  const visibleTasks = useMemo(
    () => getVisibleTasks(tasks, groupExpanded),
    [tasks, groupExpanded]
  );

  // --- Columns depend on zoom ---
  const chartColumns = useMemo(
    () => buildChartColumns(tasks, zoom),
    [tasks, zoom]
  );
  // The "stretch" column width:
  const chartAreaWidth = Math.max(
    GANTT_MIN_WIDTH,
    chartColumns.length * baseColWidth
  );
  const colDynamicWidth = chartAreaWidth / chartColumns.length;

  // Utility: which column index contains a date (for day/week/month mode)
  function dateToColIdx(dateStr) {
    const d = parseDate(dateStr);
    if (zoom === "Day") {
      return chartColumns.findIndex(
        (col) => formatDate(col.date) === formatDate(d)
      );
    } else if (zoom === "Week") {
      for (let i = 0; i < chartColumns.length; ++i) {
        let colDate = chartColumns[i].date;
        let nextColDate =
          i < chartColumns.length - 1
            ? chartColumns[i + 1].date
            : new Date(3000, 0, 1);
        if (d >= colDate && d < nextColDate) return i;
      }
      return -1;
    } else if (zoom === "Month") {
      for (let i = 0; i < chartColumns.length; ++i) {
        let colDate = chartColumns[i].date;
        let nextColDate =
          i < chartColumns.length - 1
            ? chartColumns[i + 1].date
            : new Date(3000, 0, 1);
        if (d >= colDate && d < nextColDate) return i;
      }
      return -1;
    }
    return -1;
  }

  // --- Drag/Resize Events now work in any zoom ---
  function handleBarMouseDown(e, t, row, barType = "move") {
    e.preventDefault();
    e.stopPropagation();
    const startIdx = dateToColIdx(t.start);
    const endIdx = dateToColIdx(t.end);
    setDragInfo({
      taskId: t.id,
      barType,
      startPos: e.clientX,
      originalStartIdx: startIdx,
      originalEndIdx: endIdx,
    });
  }

  function handleMouseMove(e) {
    if (!dragInfo) return;
    const deltaPx = e.clientX - dragInfo.startPos;
    const deltaUnits = Math.round(deltaPx / colDynamicWidth);
    setTasks((oldTasks) =>
      oldTasks.map((task) => {
        if (task.id !== dragInfo.taskId) return task;
        let newStart = task.start,
          newEnd = task.end;
        if (dragInfo.barType === "move") {
          const newStartIdx = dragInfo.originalStartIdx + deltaUnits;
          const newEndIdx = dragInfo.originalEndIdx + deltaUnits;
          if (newStartIdx >= 0 && newEndIdx < chartColumns.length) {
            newStart = formatDate(chartColumns[newStartIdx].date);
            newEnd = formatDate(chartColumns[newEndIdx].date);
          }
        } else if (dragInfo.barType === "resize-left") {
          const newStartIdx = dragInfo.originalStartIdx + deltaUnits;
          if (newStartIdx >= 0 && newStartIdx <= dragInfo.originalEndIdx) {
            newStart = formatDate(chartColumns[newStartIdx].date);
          }
        } else if (dragInfo.barType === "resize-right") {
          const newEndIdx = dragInfo.originalEndIdx + deltaUnits;
          if (
            newEndIdx < chartColumns.length &&
            newEndIdx >= dragInfo.originalStartIdx
          ) {
            newEnd = formatDate(chartColumns[newEndIdx].date);
          }
        }
        return { ...task, start: newStart, end: newEnd };
      })
    );
  }
  function handleMouseUp() {
    if (dragInfo) setDragInfo(NO_DRAG);
  }
  useEffect(() => {
    if (!dragInfo) return;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  });

  // --- UI ---
  return (
    <>
    {/* Zoom buttons toolbar */}
  <div style={{ margin: "20px 0 10px 20px" }}>
    {["Day", "Week", "Month"].map((z) => (
      <button
        key={z}
        className={`gantt-zoom-btn${zoom === z ? " selected" : ""}`}
        onClick={() => setZoom(z)}
      >
        {z}
      </button>
    ))}
  </div>
    <div className="gantt-container">
      
      {/* --- Sidebar Table --- */}
      <div className="gantt-sidebar">
        <table>
          <thead>
            <tr>
              <th>Task</th>
              <th>Start</th>
              <th>End</th>
            </tr>
          </thead>
          <tbody>
            {visibleTasks.map((t) =>
              t.isGroup ? (
                <tr
                  key={t.id}
                  style={{ background: "#262a48", fontWeight: 700 }}
                >
                  <td
                    colSpan={1}
                    style={{ color: "#be45ea", position: "relative" }}
                  >
                    <span
                      onClick={() =>
                        setGroupExpanded((g) => ({ ...g, [t.id]: !g[t.id] }))
                      }
                      style={{
                        marginRight: 7,
                        cursor: "pointer",
                        display: "inline-block",
                      }}
                    >
                      {groupExpanded[t.id] ? "▼" : "▶"}
                    </span>
                    {t.name}
                  </td>
                  <td>
                    {(() => {
                      const [groupStart] = getGroupDateRange(tasks, t.id);
                      return groupStart
                        ? groupStart.toISOString().slice(0, 10)
                        : "";
                    })()}
                  </td>
                  <td>
                    {(() => {
                      const [, groupEnd] = getGroupDateRange(tasks, t.id);
                      return groupEnd
                        ? groupEnd.toISOString().slice(0, 10)
                        : "";
                    })()}
                  </td>
                </tr>
              ) : (
                <tr key={t.id}>
                  <td style={t.parent ? { paddingLeft: 20 } : {}}>{t.name}</td>
                  <td>{t.start}</td>
                  <td>{t.end}</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* --- Gantt Chart --- */}
      <div className="gantt-chart-area">
        <svg
          width={chartAreaWidth}
          height={visibleTasks.length * 40 + 40}
          style={{ background: "#222", borderRadius: "8px", display: "block" }}
        >
          {/* Date header */}
          {chartColumns.map((col, idx) => (
            <g key={idx}>
              <text
                x={idx * colDynamicWidth + colDynamicWidth / 2}
                y={24}
                textAnchor="middle"
                fontSize="12"
                fill="#aaa"
                style={{ whiteSpace: "pre" }}
              >
                {col.label}
              </text>
              <line
                x1={idx * colDynamicWidth + colDynamicWidth}
                y1={0}
                x2={idx * colDynamicWidth + colDynamicWidth}
                y2={visibleTasks.length * 40 + 32}
                stroke="#333"
              />
            </g>
          ))}

          {/* Row backgrounds */}
          {visibleTasks.map((task, row) => (
            <rect
              key={task.id + "_bg"}
              x={0}
              y={row * 40 + 32}
              width={chartAreaWidth}
              height={36}
              className={
                task.isGroup
                  ? "gantt-row-parent"
                  : row % 2 === 0
                  ? "gantt-row-bg1"
                  : "gantt-row-bg2"
              }
            />
          ))}

          {/* Task & group bars */}
          {visibleTasks.map((t, row) => {
            // Group: draw bar based on min/max of child tasks
            if (t.isGroup) {
              const [groupStart, groupEnd] = getGroupDateRange(tasks, t.id);
              if (!groupStart || !groupEnd) return null;
              const startIdx = dateToColIdx(formatDate(groupStart));
              const endIdx = dateToColIdx(formatDate(groupEnd));
              return (
                <g key={t.id}>
                  <rect
                    x={startIdx * colDynamicWidth}
                    y={row * 40 + 40}
                    width={(endIdx - startIdx + 1) * colDynamicWidth}
                    height={24}
                    rx={6}
                    className="gantt-task-bar-group"
                  />
                  <text
                    x={startIdx * colDynamicWidth + 10}
                    y={row * 40 + 56}
                    fontSize="13"
                    fill="#fff"
                    style={{ pointerEvents: "none", fontWeight: 700 }}
                  >
                    {t.name}
                  </text>
                </g>
              );
            }

            // Child task bar (draggable and resizable)
            const startIdx = dateToColIdx(t.start);
            const endIdx = dateToColIdx(t.end);
            return (
              <g key={t.id}>
                <rect
                  x={startIdx * colDynamicWidth}
                  y={row * 40 + 40}
                  width={(endIdx - startIdx + 1) * colDynamicWidth}
                  height={24}
                  rx={6}
                  className="gantt-task-bar"
                  style={{ cursor: "grab" }}
                  onMouseDown={(e) => handleBarMouseDown(e, t, row, "move")}
                />
                {/* left resize handle */}
                <rect
                  x={startIdx * colDynamicWidth - 4}
                  y={row * 40 + 42}
                  width={8}
                  height={20}
                  fill="#fff"
                  style={{ cursor: "ew-resize" }}
                  onMouseDown={(e) =>
                    handleBarMouseDown(e, t, row, "resize-left")
                  }
                />
                {/* right resize handle */}
                <rect
                  x={(endIdx + 1) * colDynamicWidth - 4}
                  y={row * 40 + 42}
                  width={8}
                  height={20}
                  fill="#fff"
                  style={{ cursor: "ew-resize" }}
                  onMouseDown={(e) =>
                    handleBarMouseDown(e, t, row, "resize-right")
                  }
                />
                <text
                  x={startIdx * colDynamicWidth + 10}
                  y={row * 40 + 56}
                  fontSize="13"
                  fill="#fff"
                  style={{ pointerEvents: "none" }}
                >
                  {t.name}
                </text>
              </g>
            );
          })}

          {/* Dependency Arrows */}
          {visibleTasks.flatMap((task, targetRow) =>
            (task.dependencies || []).map((dep, i) => {
              // Only show lines if both source & target are visible (and not groups)
              const sourceIdx = visibleTasks.findIndex(
                (t) => t.id === dep.taskId
              );
              if (
                sourceIdx === -1 ||
                task.isGroup ||
                visibleTasks[sourceIdx].isGroup
              )
                return null;
              const getPos = (task, row) => {
                const startIdx = dateToColIdx(task.start);
                const endIdx = dateToColIdx(task.end);
                return {
                  startX: startIdx * colDynamicWidth,
                  endX: (endIdx + 1) * colDynamicWidth,
                  y: row * 40 + 40 + 12,
                };
              };
              const from = getPos(visibleTasks[sourceIdx], sourceIdx);
              const to = getPos(task, targetRow);

              let x1, x2, y1, y2;
              if (dep.type === "FS") {
                x1 = from.endX;
                y1 = from.y;
                x2 = to.startX;
                y2 = to.y;
              } else if (dep.type === "SS") {
                x1 = from.startX;
                y1 = from.y;
                x2 = to.startX;
                y2 = to.y;
              } else if (dep.type === "FF") {
                x1 = from.endX;
                y1 = from.y;
                x2 = to.endX;
                y2 = to.y;
              } else {
                x1 = from.endX;
                y1 = from.y;
                x2 = to.startX;
                y2 = to.y;
              }
              const elbowOffset = 40;
              const midX = x1 + elbowOffset;
              const path = `
                M ${x1},${y1}
                H ${midX}
                V ${y2}
                H ${x2 - 8}
                L ${x2},${y2}
              `;
              return (
                <g key={task.id + dep.type + dep.taskId + i}>
                  <path
                    d={path}
                    fill="none"
                    className="gantt-arrow"
                    markerEnd="url(#arrowhead)"
                  />
                </g>
              );
            })
          )}

          {/* Arrowhead marker definition (once) */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="4"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L8,4 L0,8 Z" fill="#eed265" />
            </marker>
          </defs>
        </svg>
      </div>
    </div>
    </>
  );
}

export default App;
