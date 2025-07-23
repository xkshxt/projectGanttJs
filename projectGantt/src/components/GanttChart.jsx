// src/components/GanttChart.jsx
import React from "react";
import tasks from "../data/tasks";
import "../styles/gantt.css";
import { useState, useEffect, useRef } from "react";
import EditModal from "./EditModal";
import DependencyArrow from "./DependencyArrow";

const getWeekNumber = (date) => {
  const d = new Date(date);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return weekNo;
};

const zoomSettings = {
  day: { unit: "day", width: 30 },
  week: { unit: "week", width: 60 },
  month: { unit: "month", width: 90 },
};

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
const generateTimelineDates = (start, end, unit = "day") => {
  const dates = [];
  const current = new Date(start);

  while (current <= end) {
    dates.push(new Date(current));

    if (unit === "day") {
      current.setDate(current.getDate() + 1);
    } else if (unit === "week") {
      current.setDate(current.getDate() + 7);
    } else if (unit === "month") {
      current.setMonth(current.getMonth() + 1);
    }
  }
  return dates;
};

const GanttChart = () => {
  const [taskData, setTaskData] = useState(tasks);
  const [selectedTask, setSelectedTask] = useState(null);
  const handleTaskUpdate = (updatedTask) => {
    setTaskData((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  };
  const [zoom, setZoom] = useState("day"); // Default is day view
  const timelineRef = useRef();

  const { unit, width: dayWidth } = zoomSettings[zoom];
  const [timelineStart, timelineEnd] = getTimelineRange(tasks);
  const timelineDates = generateTimelineDates(timelineStart, timelineEnd, unit);

    useEffect(() => {
    if (!timelineRef.current) return;

    const today = new Date().toISOString().split("T")[0];
    const todayIndex = timelineDates.findIndex(
      (d) => d.toISOString().split("T")[0] === today
    );

    const scrollToIndex = todayIndex !== -1 ? todayIndex : 0;
    timelineRef.current.scrollLeft = scrollToIndex * dayWidth;
  }, [timelineDates, dayWidth]);


return (
  <div className="gantt-container">
    <div className="gantt-header">
      <h2>📊 Gantt Chart</h2>
      <select value={zoom} onChange={(e) => setZoom(e.target.value)}>
        <option value="day">Day</option>
        <option value="week">Week</option>
        <option value="month">Month</option>
      </select>
    </div>

    <div className="gantt-body">
      {/* TASK LABEL COLUMN */}
      <div className="task-label-column">
        <div className="task-label-header"></div>
        {taskData.map((task) => (
          <div key={task.id} className="task-label">
            {task.name}
          </div>
        ))}
      </div>

      {/* TIMELINE COLUMN */}
      <div className="timeline-column" ref={timelineRef}>
        {/* TIMELINE HEADER */}
        <div className="timeline-header">
          {timelineDates.map((date, idx) => (
            <div key={idx} className="day-box">
              {zoom === "day"
                ? date.toISOString().split("T")[0].slice(5)
                : zoom === "week"
                ? `Wk ${getWeekNumber(date)}`
                : date.toLocaleString("default", {
                    month: "short",
                    year: "2-digit",
                  })}
            </div>
          ))}
        </div>

        {/* TASK ROWS + DEPENDENCIES */}
        <div style={{ position: "relative", height: taskData.length * 40 }}>
          {taskData.map((task, index) => {
            const offset = getDaysBetween(timelineStart, task.start);
            const duration = getDaysBetween(task.start, task.end);

            const handleDragStart = (e) => {
              e.dataTransfer.setData("text/plain", index);
              e.dataTransfer.effectAllowed = "move";
            };

            const handleDrop = (e) => {
              e.preventDefault();
              const draggedIndex = parseInt(
                e.dataTransfer.getData("text/plain"),
                10
              );
              const offsetX = e.nativeEvent.offsetX;
              const movedDays = Math.round(offsetX / dayWidth);

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
                <div
                  className="task-bar"
                  draggable
                  onDragStart={handleDragStart}
                  onClick={() => setSelectedTask(task)}
                  style={{
                    marginLeft: offset * dayWidth,
                    width: duration * dayWidth,
                  }}
                >
                  {task.progress}%
                  <div
                    className="resize-handle"
                    onMouseDown={(e) => {
                      let startX = e.clientX;
                      const handleMouseMove = (moveEvent) => {
                        const deltaX = moveEvent.clientX - startX;
                        const deltaDays = Math.round(deltaX / dayWidth);

                        if (deltaDays !== 0) {
                          setTaskData((prev) => {
                            const newTasks = [...prev];
                            const updated = { ...newTasks[index] };
                            const newEnd = new Date(updated.end);
                            newEnd.setDate(newEnd.getDate() + deltaDays);
                            updated.end = newEnd.toISOString().split("T")[0];
                            newTasks[index] = updated;
                            return newTasks;
                          });
                          startX = moveEvent.clientX;
                        }
                      };
                      const handleMouseUp = () => {
                        window.removeEventListener("mousemove", handleMouseMove);
                        window.removeEventListener("mouseup", handleMouseUp);
                      };
                      window.addEventListener("mousemove", handleMouseMove);
                      window.addEventListener("mouseup", handleMouseUp);
                    }}
                  />
                </div>
              </div>
            );
          })}

          {/* DEPENDENCY LINES */}
          {taskData.flatMap((task, i) =>
            task.dependencies.map((dep, j) => {
              const [depId, typeAndOffset] = dep.split(":");
              const type = typeAndOffset.slice(0, 2);
              const offset = typeAndOffset.slice(2);
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
      </div>
    </div>

    {selectedTask && (
      <EditModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onSave={handleTaskUpdate}
      />
    )}
  </div>
);
};

export default GanttChart;
