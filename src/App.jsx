import React, { useMemo, useState, useEffect } from "react";
import "./index.css";
import initialTasksRaw from "./tasksData";

// --- Group color theme mapping ---
const GROUP_COLORS = {
  Planning: { bar: "#c44eea", text: "#ea95fd" },
  Creative: { bar: "#69c763", text: "#69c763" },
  SEO: { bar: "#e0b55b", text: "#e0b55b" },
  Development: { bar: "#68a1fc", text: "#68a1fc" },
  "Ad Campaigns": { bar: "#58e3e3", text: "#58e3e3" },
  Launch: { bar: "#b67afc", text: "#b67afc" },
};
const DEFAULT_BAR = "#54a9ff";
const DEFAULT_TEXT = "#eee";

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
    d.setDate(d.getDate() - d.getDay());
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

function App() {
  // --- ZOOM STATE ---
  const [zoom, setZoom] = useState("Day");
  // Dynamic width per time column
  const baseColWidth = zoom === "Day" ? 40 : zoom === "Week" ? 60 : 120;

  // --- GROUP COLLAPSE ---
  const [groupExpanded, setGroupExpanded] = useState(() =>
    Object.fromEntries(
      initialTasksRaw.filter((t) => t.isGroup).map((t) => [t.id, !!t.expanded])
    )
  );
  const [tasks, setTasks] = useState(initialTasksRaw);
  const [dragInfo, setDragInfo] = useState(NO_DRAG);

  // Modal state
  const [editTaskId, setEditTaskId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const visibleTasks = useMemo(
    () => getVisibleTasks(tasks, groupExpanded),
    [tasks, groupExpanded]
  );

  // --- Columns for timeline ---
  const chartColumns = useMemo(
    () => buildChartColumns(tasks, zoom),
    [tasks, zoom]
  );

  // Chart is always at least full width: subtract sidebar width, use 100vw for real responsiveness
  // Make space for the sidebar (320px). NOTE: on tiny screens you might want to reduce it.
  const ganttChartPixelWidth = Math.max(
    chartColumns.length * baseColWidth, // regular, tightly fit
    window.innerWidth - 340 // fill full browser width, minus sidebar and gutter
  );

  const colDynamicWidth = ganttChartPixelWidth / chartColumns.length;

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

  // --- Edit Modal Logic ---
  function openEditModal(task) {
    setEditTaskId(task.id);
    setEditForm({ name: task.name, start: task.start, end: task.end });
  }
  function closeEditModal() {
    setEditTaskId(null);
    setEditForm(null);
  }
  function saveEditModal() {
    setTasks((ts) =>
      ts.map((t) =>
        t.id === editTaskId
          ? {
              ...t,
              name: editForm.name,
              start: editForm.start,
              end: editForm.end,
            }
          : t
      )
    );
    closeEditModal();
  }

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
              {visibleTasks.map((t) => {
                // Find group color for sidebar as well!
                const groupName = t.isGroup
                  ? t.name
                  : tasks.find((tt) => tt.id === t.parent)?.name || "Planning";
                const groupColor = GROUP_COLORS[groupName] || {
                  bar: DEFAULT_BAR,
                  text: "#fff",
                };
                return t.isGroup ? (
                  <tr
                    key={t.id}
                    style={{ background: "#262a48", fontWeight: 700 }}
                  >
                    <td
                      colSpan={1}
                      style={{
                        color: groupColor.bar,
                        position: "relative",
                      }}
                    >
                      <span
                        onClick={() =>
                          setGroupExpanded((g) => ({
                            ...g,
                            [t.id]: !g[t.id],
                          }))
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
                    <td
                      style={
                        t.parent
                          ? { paddingLeft: 20, color: groupColor.bar }
                          : { color: groupColor.bar }
                      }
                    >
                      {/* Colored square at left: */}
                      <span
                        style={{
                          display: "inline-block",
                          width: 12,
                          height: 12,
                          verticalAlign: "middle",
                          marginRight: 7,
                          background: groupColor.bar,
                          borderRadius: 2,
                          boxShadow: "0 0 3px #111a",
                        }}
                      />
                      {t.name}
                    </td>
                    <td>{t.start}</td>
                    <td>{t.end}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* --- Gantt Chart --- */}
        <div className="gantt-chart-area">
          <svg
            width="100%"
            height={visibleTasks.length * 40 + 40}
            viewBox={`0 0 ${ganttChartPixelWidth} ${
              visibleTasks.length * 40 + 40
            }`}
            style={{
              background: "#222",
              borderRadius: "8px",
              display: "block",
              width: "100%",
              minWidth: ganttChartPixelWidth, // ensure fills available area
            }}
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
                width={ganttChartPixelWidth}
                height={36}
                fill={
                  task.isGroup
                    ? "#262a48"
                    : row % 2 === 0
                    ? "#1d2033"
                    : "#23263a"
                }
              />
            ))}

            {/* Task & group bars */}
            {visibleTasks.map((t, row) => {
              // Find color for this bar (by group)
              const groupName = t.isGroup
                ? t.name
                : tasks.find((tt) => tt.id === t.parent)?.name || "Planning";
              const groupColor = GROUP_COLORS[groupName] || {
                bar: DEFAULT_BAR,
                text: DEFAULT_TEXT,
              };

              if (t.isGroup) {
                // Group: draw bar based on min/max of child tasks
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
                      fill={groupColor.bar}
                      stroke={groupColor.bar}
                    />
                    <text
                      x={startIdx * colDynamicWidth + 10}
                      y={row * 40 + 56}
                      fontSize="13"
                      fill={groupColor.text}
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
                    fill={groupColor.bar}
                    stroke={groupColor.bar}
                    style={{ cursor: "grab" }}
                    onMouseDown={(e) => handleBarMouseDown(e, t, row, "move")}
                    onClick={() => openEditModal(t)}
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
                    fill={groupColor.text}
                    style={{ pointerEvents: "none" }}
                  >
                    {t.name}
                  </text>
                </g>
              );
            })}

            {/* Dependency Arrows (with lag/lead handling, color-coded) */}
            {visibleTasks.flatMap((task, targetRow) =>
              (task.dependencies || []).map((dep, i) => {
                const sourceIdx = visibleTasks.findIndex(
                  (t) => t.id === dep.taskId
                );
                if (
                  sourceIdx === -1 ||
                  task.isGroup ||
                  visibleTasks[sourceIdx].isGroup
                )
                  return null;

                function getLaggedColIdx(dateStr) {
                  let baseIdx = dateToColIdx(dateStr);
                  if (baseIdx < 0) return baseIdx;
                  if (zoom === "Day") {
                    return baseIdx + (dep.lag || 0);
                  }
                  if (zoom === "Week") {
                    return baseIdx + Math.round((dep.lag || 0) / 7);
                  }
                  if (zoom === "Month") {
                    return baseIdx + Math.round((dep.lag || 0) / 30);
                  }
                  return baseIdx;
                }

                const sourceTask = visibleTasks[sourceIdx];
                const targetTask = task;
                const lag = dep.lag || 0;

                let x1, y1, x2, y2;
                if (dep.type === "FS") {
                  const fromIdx = getLaggedColIdx(sourceTask.end, lag);
                  const toIdx = dateToColIdx(targetTask.start);
                  x1 = (fromIdx + 1) * colDynamicWidth;
                  y1 = sourceIdx * 40 + 40 + 12;
                  x2 = toIdx * colDynamicWidth;
                  y2 = targetRow * 40 + 40 + 12;
                } else if (dep.type === "SS") {
                  const fromIdx = getLaggedColIdx(sourceTask.start, lag);
                  const toIdx = dateToColIdx(targetTask.start);
                  x1 = fromIdx * colDynamicWidth;
                  y1 = sourceIdx * 40 + 40 + 12;
                  x2 = toIdx * colDynamicWidth;
                  y2 = targetRow * 40 + 40 + 12;
                } else if (dep.type === "FF") {
                  const fromIdx = getLaggedColIdx(sourceTask.end, lag);
                  const toIdx = dateToColIdx(targetTask.end);
                  x1 = (fromIdx + 1) * colDynamicWidth;
                  y1 = sourceIdx * 40 + 40 + 12;
                  x2 = (toIdx + 1) * colDynamicWidth;
                  y2 = targetRow * 40 + 40 + 12;
                } else {
                  const fromIdx = getLaggedColIdx(sourceTask.end, lag);
                  const toIdx = dateToColIdx(targetTask.start);
                  x1 = (fromIdx + 1) * colDynamicWidth;
                  y1 = sourceIdx * 40 + 40 + 12;
                  x2 = toIdx * colDynamicWidth;
                  y2 = targetRow * 40 + 40 + 12;
                }

                const elbowOffset = 40;
                const midX = x1 + elbowOffset * Math.sign(x2 - x1 || 1);
                const path = `
                  M ${x1},${y1}
                  H ${midX}
                  V ${y2}
                  H ${x2 - 8 * Math.sign(x2 - midX)}
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
                    {lag !== 0 && (
                      <text
                        x={(x1 + midX) / 2}
                        y={Math.min(y1, y2) - 8}
                        fontSize="11"
                        fill="#eed265"
                        fontWeight="bold"
                        textAnchor="middle"
                        stroke="#181c26"
                        strokeWidth="3"
                        paintOrder="stroke"
                        style={{ pointerEvents: "none" }}
                      >
                        {lag > 0 ? "+" + lag + "d" : lag + "d"}
                      </text>
                    )}
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

          {/* --- Edit Modal --- */}
          {editTaskId && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(0,0,0,0.38)",
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={closeEditModal}
            >
              <div
                style={{
                  background: "#23263b",
                  color: "#fff",
                  borderRadius: "10px",
                  padding: "28px 34px 20px 34px",
                  boxShadow: "0 6px 40px #171c38",
                  minWidth: 350,
                  minHeight: 210,
                  zIndex: 1001,
                  position: "relative",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h2 style={{ color: "#eed265", margin: 0, marginBottom: 10 }}>
                  Edit Task
                </h2>
                <div style={{ marginBottom: 15 }}>
                  <label>
                    <div style={{ fontSize: 13, marginBottom: 4 }}>Name</div>
                    <input
                      style={{
                        fontSize: 16,
                        borderRadius: 6,
                        border: "1.5px solid #888a",
                        padding: "5px 10px",
                        background: "#181c26",
                        color: "#fff",
                        width: "95%",
                        marginBottom: 6,
                      }}
                      value={editForm?.name || ""}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, name: e.target.value }))
                      }
                    />
                  </label>
                  <label>
                    <div style={{ fontSize: 13, marginBottom: 4 }}>
                      Start Date
                    </div>
                    <input
                      type="date"
                      style={{
                        fontSize: 15,
                        borderRadius: 6,
                        border: "1px solid #888a",
                        background: "#181c26",
                        color: "#fff",
                        marginBottom: 6,
                      }}
                      value={editForm?.start || ""}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, start: e.target.value }))
                      }
                    />
                  </label>
                  <label>
                    <div style={{ fontSize: 13, marginBottom: 4 }}>
                      End Date
                    </div>
                    <input
                      type="date"
                      style={{
                        fontSize: 15,
                        borderRadius: 6,
                        border: "1px solid #888a",
                        background: "#181c26",
                        color: "#fff",
                      }}
                      value={editForm?.end || ""}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, end: e.target.value }))
                      }
                    />
                  </label>
                  {/* Show dependencies */}
                  <div style={{ marginTop: 10, fontSize: 13 }}>
                    <b>Dependencies:</b>
                    <ul style={{ margin: "5px 0 0 20px", padding: 0 }}>
                      {(
                        tasks.find((t) => t.id === editTaskId)?.dependencies ||
                        []
                      ).length === 0 ? (
                        <li style={{ color: "#999" }}>None</li>
                      ) : (
                        (
                          tasks.find((t) => t.id === editTaskId)
                            ?.dependencies || []
                        ).map((dep, i) => {
                          // Display dep type, task name, lag
                          const fromTask = tasks.find(
                            (t) => t.id === dep.taskId
                          );
                          return (
                            <li key={i}>
                              {dep.type}➔{" "}
                              <b>{fromTask ? fromTask.name : dep.taskId}</b>
                              {dep.lag ? (
                                <span
                                  style={{ color: "#eed265", fontWeight: 600 }}
                                >
                                  {" "}
                                  {dep.lag > 0
                                    ? "+" + dep.lag + "d"
                                    : dep.lag + "d"}
                                </span>
                              ) : null}
                            </li>
                          );
                        })
                      )}
                    </ul>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <button
                    onClick={closeEditModal}
                    style={{
                      marginRight: 10,
                      background: "#181c26",
                      border: "1px solid #333",
                      color: "#eee",
                      borderRadius: 5,
                      padding: "6px 15px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEditModal}
                    style={{
                      background: "#eed265",
                      color: "#222",
                      border: "1px solid #eed265",
                      borderRadius: 5,
                      padding: "6px 15px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Save
                  </button>
                </div>
                {/* Modal close X */}
                <button
                  onClick={closeEditModal}
                  style={{
                    position: "absolute",
                    right: 17,
                    top: 11,
                    background: "none",
                    color: "#eed265",
                    fontWeight: 600,
                    border: "none",
                    fontSize: 22,
                    cursor: "pointer",
                  }}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
