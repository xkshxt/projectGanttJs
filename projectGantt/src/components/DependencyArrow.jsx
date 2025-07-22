// src/components/DependencyArrow.jsx
import React from "react";

// Helper: convert date to X-position (based on day width)
const getX = (date, timelineStart, dayWidth) => {
  const msPerDay = 1000 * 60 * 60 * 24;
  const diffDays = (new Date(date) - new Date(timelineStart)) / msPerDay;
  return diffDays * dayWidth;
};

// Arrow between two coordinates
const DependencyArrow = ({ fromTask, toTask, type, offset, timelineStart, dayWidth }) => {
  let fromX, toX;

  const fromStart = new Date(fromTask.start);
  const fromEnd = new Date(fromTask.end);
  const toStart = new Date(toTask.start);
  const toEnd = new Date(toTask.end);

  // Apply offset
  let lagDays = 0;
  if (offset) {
    const sign = offset.startsWith("+") ? 1 : -1;
    lagDays = parseInt(offset.replace(/[^\d]/g, ""), 10) * sign;
  }

  if (type === "FS") {
    fromX = getX(fromEnd, timelineStart, dayWidth);
    toX = getX(toStart, timelineStart, dayWidth) + lagDays * dayWidth;
  } else if (type === "SS") {
    fromX = getX(fromStart, timelineStart, dayWidth);
    toX = getX(toStart, timelineStart, dayWidth) + lagDays * dayWidth;
  } else if (type === "FF") {
    fromX = getX(fromEnd, timelineStart, dayWidth);
    toX = getX(toEnd, timelineStart, dayWidth) + lagDays * dayWidth;
  } else {
    return null;
  }

  const fromY = 40 * (fromTask.index + 1) + 12; // 12 is vertical center
  const toY = 40 * (toTask.index + 1) + 12;

  const path = `M ${fromX},${fromY} L ${toX},${toY}`;

  return (
    <svg className="dependency-line">
      <path d={path} stroke="#888" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#888" />
        </marker>
      </defs>
    </svg>
  );
};

export default DependencyArrow;
