// src/components/GanttChart.jsx
import React from "react";
import tasks from "../data/tasks";
import "../styles/gantt.css";
import { useState } from "react";
import DependencyArrow from "./DependencyArrow";


// Utility to calculate date difference in da ys
const getDaysBetween = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate - startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Get timeline range based on tasks
const getTimelineRange = (tasks) => {
  const allDates = tasks.flatMap((t) => [new Date(t.start), new Date(t.end)]);
  const min = new Date(Math.min(...allDates));
  const max = new Date(Math.max(...allDates));
  return [min, max];
};

// Generate date list for the timeline
const generateTimelineDates = (start, end) => {
  const dates = [];
  const current = new Date(start);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

const GanttChart = () => {
  const [taskData, setTaskData] = useState(tasks);
  const [timelineStart, timelineEnd] = getTimelineRange(tasks);
  const timelineDates = generateTimelineDates(timelineStart, timelineEnd);

  const dayWidth = 30; // px

  return (
    <div className="gantt-container">
      <h2>📊 Gantt Chart</h2>

      {/* TIMELINE HEADER */}
      <div className="timeline-header">
        <div className="task-label-header" />
        <div className="timeline-days">
          {timelineDates.map((date, idx) => (
            <div key={idx} className="day-box">
              {date.toISOString().split("T")[0].slice(5)}
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: "relative", height: taskData.length * 40 + 40 }}>
  {taskData.flatMap((task, i) =>
    task.dependencies.map((dep, j) => {
      const [depId, typeAndOffset] = dep.split(":");
      const type = typeAndOffset.slice(0, 2);
      const offset = typeAndOffset.slice(2); // "+2d", "-1d", etc.
      const fromTask = taskData.find((t) => t.id === depId);
      if (!fromTask) return null;
      return (
        <DependencyArrow
          key={`${task.id}-dep-${j}`}
          fromTask={{ ...fromTask, index: taskData.indexOf(fromTask) }}
          toTask={{ ...task, index: i }}
          type={type}
          offset={offset}
          timelineStart={timelineStart}
          dayWidth={dayWidth}
        />
      );
    })
  )}
</div>


      {/* TASK ROWS */}
      <div className="gantt-grid">
        {taskData.map((task, index) => {
          const offset = getDaysBetween(timelineStart, task.start);
          const duration = getDaysBetween(task.start, task.end);

          /* ----- Drag helpers ----- */
          const handleDragStart = (e) => {
            e.dataTransfer.setData("text/plain", index); // which bar?
            e.dataTransfer.effectAllowed = "move";
          };

          const handleDrop = (e) => {
            e.preventDefault();
            const draggedIndex = parseInt(
              e.dataTransfer.getData("text/plain"),
              10
            );

            const offsetX = e.nativeEvent.offsetX; // px moved
            const movedDays = Math.round(offsetX / dayWidth);

            // clone -> mutate -> set
            setTaskData((prev) => {
              const newTasks = [...prev];
              const draggedTask = { ...newTasks[draggedIndex] };

              const newStart = new Date(draggedTask.start);
              const newEnd = new Date(draggedTask.end);
              newStart.setDate(newStart.getDate() + movedDays);
              newEnd.setDate(newEnd.getDate() + movedDays);

              draggedTask.start = newStart.toISOString().split("T")[0];
              draggedTask.end = newEnd.toISOString().split("T")[0];
              newTasks[draggedIndex] = draggedTask;
              return newTasks;
            });
          };

return (
            <div
              key={task.id}
              className="task-row"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <span className="task-label">{task.name}</span>
              <div className="timeline-days">
                <div
                  className="task-bar"
                  draggable
                  onDragStart={handleDragStart}
                  style={{
                    marginLeft: offset * dayWidth,
                    width: duration * dayWidth,
                  }}
                >
                  {task.progress}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GanttChart;