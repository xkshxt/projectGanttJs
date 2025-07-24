import React, { useMemo, useState, useEffect } from "react";
import "./GanttChart.css";
import initialTasksRaw from "./tasksData";

// ----- Helpers -----
function parseDate(str) {
  return new Date(str + "T00:00:00");
}

function getGroupDateRange(tasks, groupId) {
  const children = tasks.filter((t) => t.parent === groupId);
  if (children.length === 0) return [null, null];
  let min = parseDate(children[0].start);
  let max = parseDate(children[0].end);
  children.forEach((t) => {
    const st = parseDate(t.start);
    const en = parseDate(t.end);
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

// ----- Drag + Resize State Logic -----
const NO_DRAG = null; // { taskId, barType, startPos, originalStartIdx, originalEndIdx }

function App() {
  // Track expanded/collapsed group state
  const [groupExpanded, setGroupExpanded] = useState(
    () =>
      Object.fromEntries(
        initialTasksRaw.filter((t) => t.isGroup).map((t) => [t.id, !!t.expanded])
      )
  );
  // Now tasks are editable!
  const [tasks, setTasks] = useState(initialTasksRaw);
  // For drag/resize gesture
  const [dragInfo, setDragInfo] = useState(NO_DRAG);

  const visibleTasks = useMemo(
    () => getVisibleTasks(tasks, groupExpanded),
    [tasks, groupExpanded]
  );

  // Only consider real tasks (skip groups)
  const { chartDays } = useMemo(() => {
    const tasksOnly = tasks.filter((t) => !t.isGroup);
    let min = parseDate(tasksOnly[0].start);
    let max = parseDate(tasksOnly[0].end);
    tasksOnly.forEach((t) => {
      const start = parseDate(t.start);
      const end = parseDate(t.end);
      if (start < min) min = start;
      if (end > max) max = end;
    });
    const days = [];
    let d = new Date(min);
    while (d <= max) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return { chartDays: days };
  }, [tasks]);

  // --- Drag/Resize Events ---
  function handleBarMouseDown(e, t, row, barType = "move") {
    // barType = "move" (whole bar), "resize-left", "resize-right"
    e.preventDefault();
    e.stopPropagation();
    const startIdx = chartDays.findIndex(
      (d) => d.toISOString().slice(0, 10) === t.start
    );
    const endIdx = chartDays.findIndex(
      (d) => d.toISOString().slice(0, 10) === t.end
    );
    const startPos = e.clientX;
    setDragInfo({
      taskId: t.id,
      barType,
      startPos,
      originalStartIdx: startIdx,
      originalEndIdx: endIdx,
    });
  }

  function handleMouseMove(e) {
    if (!dragInfo) return;
    const deltaPx = e.clientX - dragInfo.startPos;
    const deltaDays = Math.round(deltaPx / 40); // 1 col = 40px
    setTasks((oldTasks) =>
      oldTasks.map((task) => {
        if (task.id !== dragInfo.taskId) return task;
        let newStart = task.start, newEnd = task.end;
        if (dragInfo.barType === "move") {
          const newStartIdx = dragInfo.originalStartIdx + deltaDays;
          const newEndIdx = dragInfo.originalEndIdx + deltaDays;
          if (newStartIdx >= 0 && newEndIdx < chartDays.length) {
            newStart = chartDays[newStartIdx].toISOString().slice(0, 10);
            newEnd = chartDays[newEndIdx].toISOString().slice(0, 10);
          }
        } else if (dragInfo.barType === "resize-left") {
          const newStartIdx = dragInfo.originalStartIdx + deltaDays;
          if (
            newStartIdx >= 0 &&
            newStartIdx <= dragInfo.originalEndIdx
          ) {
            newStart = chartDays[newStartIdx].toISOString().slice(0, 10);
          }
        } else if (dragInfo.barType === "resize-right") {
          const newEndIdx = dragInfo.originalEndIdx + deltaDays;
          if (
            newEndIdx < chartDays.length &&
            newEndIdx >= dragInfo.originalStartIdx
          ) {
            newEnd = chartDays[newEndIdx].toISOString().slice(0, 10);
          }
        }
        return { ...task, start: newStart, end: newEnd };
      })
    );
  }

  function handleMouseUp() {
    if (dragInfo) setDragInfo(NO_DRAG);
  }

  // Attach global drag handlers when active
  useEffect(() => {
    if (!dragInfo) return;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  });

  return (
    <div className="gantt-container">
      {/* Sidebar Table */}
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
                <tr key={t.id} style={{ background: "#262a48", fontWeight: 700 }}>
                  <td colSpan={1} style={{ color: "#be45ea", position: "relative" }}>
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
                  {/* Calculate group date range dynamically */}
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
      {/* Chart */}
      <div className="gantt-chart-area">
        <svg
          width={chartDays.length * 40}
          height={visibleTasks.length * 40 + 40}
          style={{ background: "#222", borderRadius: "8px" }}
        >
          {/* Date header */}
          {chartDays.map((day, idx) => (
            <g key={idx}>
              <text
                x={idx * 40 + 20}
                y={24}
                textAnchor="middle"
                fontSize="12"
                fill="#aaa"
              >
                {day.toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                })}
              </text>
              <line
                x1={idx * 40 + 40}
                y1={0}
                x2={idx * 40 + 40}
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
              width={chartDays.length * 40}
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
              if (!groupStart || !groupEnd) return null; // Only draw if group has children
              const startIdx = chartDays.findIndex(
                (d) =>
                  d.toISOString().slice(0, 10) ===
                  groupStart.toISOString().slice(0, 10)
              );
              const endIdx = chartDays.findIndex(
                (d) =>
                  d.toISOString().slice(0, 10) ===
                  groupEnd.toISOString().slice(0, 10)
              );
              return (
                <g key={t.id}>
                  <rect
                    x={startIdx * 40}
                    y={row * 40 + 40}
                    width={(endIdx - startIdx + 1) * 40}
                    height={24}
                    rx={6}
                    className="gantt-task-bar-group"
                  />
                  <text
                    x={startIdx * 40 + 10}
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
            const startIdx = chartDays.findIndex(
              (d) => d.toISOString().slice(0, 10) === t.start
            );
            const endIdx = chartDays.findIndex(
              (d) => d.toISOString().slice(0, 10) === t.end
            );
            return (
              <g key={t.id}>
                <rect
                  x={startIdx * 40}
                  y={row * 40 + 40}
                  width={(endIdx - startIdx + 1) * 40}
                  height={24}
                  rx={6}
                  className="gantt-task-bar"
                  style={{ cursor: "grab" }}
                  onMouseDown={(e) => handleBarMouseDown(e, t, row, "move")}
                />
                {/* left resize handle */}
                <rect
                  x={startIdx * 40 - 4}
                  y={row * 40 + 42}
                  width={8}
                  height={20}
                  fill="#fff"
                  style={{ cursor: "ew-resize" }}
                  onMouseDown={(e) => handleBarMouseDown(e, t, row, "resize-left")}
                />
                {/* right resize handle */}
                <rect
                  x={(endIdx + 1) * 40 - 4}
                  y={row * 40 + 42}
                  width={8}
                  height={20}
                  fill="#fff"
                  style={{ cursor: "ew-resize" }}
                  onMouseDown={(e) => handleBarMouseDown(e, t, row, "resize-right")}
                />
                <text
                  x={startIdx * 40 + 10}
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
              const sourceIdx = visibleTasks.findIndex((t) => t.id === dep.taskId);
              if (
                sourceIdx === -1 ||
                task.isGroup ||
                visibleTasks[sourceIdx].isGroup
              )
                return null;
              const getPos = (task, row) => {
                const startIdx = chartDays.findIndex(
                  (d) => d.toISOString().slice(0, 10) === task.start
                );
                const endIdx = chartDays.findIndex(
                  (d) => d.toISOString().slice(0, 10) === task.end
                );
                return {
                  startX: startIdx * 40,
                  endX: (endIdx + 1) * 40,
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
  );
}

export default App;