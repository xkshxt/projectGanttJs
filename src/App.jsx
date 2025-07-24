import React, { useMemo } from "react";
import "./GanttChart.css";
import initialTasks from "./tasksData";

// ----- Helpers -----
function parseDate(str) {
  return new Date(str + "T00:00:00");
}

// ----- React Component -----
function App() {
  // 🟡 Move hook here!
  // Use _chartStart, _chartEnd to avoid lint warning
  const { _chartStart, _chartEnd, chartDays } = useMemo(() => {
    let min = parseDate(initialTasks[0].start);
    let max = parseDate(initialTasks[0].end);
    initialTasks.forEach((t) => {
      const start = parseDate(t.start);
      const end = parseDate(t.end);
      if (start < min) min = start;
      if (end > max) max = end;
    });
    // Extend by 2 days for padding
    min = new Date(min);
    min.setDate(min.getDate() - 1);
    max = new Date(max);
    max.setDate(max.getDate() + 1);

    // Build date array for each column
    const days = [];
    let d = new Date(min);
    while (d <= max) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return { _chartStart: min, _chartEnd: max, chartDays: days };
  }, []); // Lint: do NOT include initialTasks, as it won't change

  function getTaskBarPosition(task, row) {
    const startIdx = chartDays.findIndex(
      (d) => d.toISOString().slice(0, 10) === task.start
    );
    const endIdx = chartDays.findIndex(
      (d) => d.toISOString().slice(0, 10) === task.end
    );
    return {
      row,
      startIdx,
      endIdx,
      // Chart x/y positions for start/end
      y: row * 40 + 40,
      startX: startIdx * 40 + 41,
      endX: (endIdx + 1) * 40 + 37, // "end" of the bar
    };
  }

  return (
    <div className="gantt-container">
      {/* Left - Task Table */}
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
            {initialTasks.map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{t.start}</td>
                <td>{t.end}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Right - Chart */}
      <div className="gantt-chart-area">
        <svg
          width={chartDays.length * 40}
          height={initialTasks.length * 40 + 40}
          style={{ background: "#222", borderRadius: "8px" }}
        >
          {/* Date header */}
          {chartDays.map((day, idx) => (
            <g key={idx}>
              {/* Header labels */}
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
              {/* Vertical grid line */}
              <line
                x1={idx * 40 + 40}
                y1={0}
                x2={idx * 40 + 40}
                y2={initialTasks.length * 40 + 32}
                stroke="#333"
              />
            </g>
          ))}

          
          {/* Task bars */}
          {initialTasks.map((t, row) => {
            const startIdx = chartDays.findIndex(
              (d) => d.toISOString().slice(0, 10) === t.start
            );
            const endIdx = chartDays.findIndex(
              (d) => d.toISOString().slice(0, 10) === t.end
            );
            return (
              <g key={t.id}>
                {/* Row background */}
                <rect
                  x={0}
                  y={row * 40 + 32}
                  width={chartDays.length * 40}
                  height={36}
                  fill={row % 2 === 0 ? "#22283d" : "#23283e"}
                />
                {/* Task bar */}
                <rect
                  x={startIdx * 40 + 41}
                  y={row * 40 + 40}
                  width={(endIdx - startIdx + 1) * 40 - 4}
                  height={24}
                  rx={6}
                  fill="#5CB4FF"
                  stroke="#268de3"
                  strokeWidth="1"
                />
                {/* Dependency Arrows */}
          {initialTasks.flatMap((task, targetRow) =>
            task.dependencies.map((dep, i) => {
              const sourceIdx = initialTasks.findIndex(
                (t) => t.id === dep.taskId
              );
              if (sourceIdx === -1) return null;
              const sourceTask = initialTasks[sourceIdx];
              const sourcePos = getTaskBarPosition(sourceTask, sourceIdx);
              const targetPos = getTaskBarPosition(task, targetRow);

              let x1 = sourcePos.endX;
              let y1 = sourcePos.y + 12;
              let x2 = targetPos.startX;
              let y2 = targetPos.y + 12;

              if (dep.type === "SS") {
                x1 = sourcePos.startX;
                x2 = targetPos.startX;
              }
              if (dep.type === "FF") {
                x1 = sourcePos.endX;
                x2 = targetPos.endX;
              }

              // Stronger elbow: go right 40px, then down, then left to target
              const elbow_offset = 40; // Make this BIG
              let path;
              if (dep.type === "FS") {
                path = `
        M${x1},${y1}
        H${x1 + elbow_offset}
        V${y2}
        H${x2 - 8}
        L${x2},${y2}
      `;
              } else {
                // For SS/FF just use line for now if you want (can improve later)
                path = `M${x1},${y1} L${x2},${y2}`;
              }

              return (
                <g key={task.id + dep.type + dep.taskId + i}>
                  <path
                    d={path}
                    fill="none"
                    stroke="#eed265"
                    strokeWidth="2.5"
                    markerEnd="url(#arrowhead)"
                  />
                </g>
              );
            })
          )}

          {/* Arrowhead Marker Definition */}
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
                {/* Task label */}
                <text
                  x={startIdx * 40 + 48}
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
        </svg>
      </div>
    </div>
  );
}

export default App;
