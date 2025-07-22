// src/data/tasks.js

const tasks = [
  {
    id: "task-1",
    name: "Design",
    start: "2025-07-20",
    end: "2025-07-24",
    progress: 75,
    dependencies: ["task-2:FS+1d"]
  },
  {
    id: "task-2",
    name: "Development",
    start: "2025-07-22",
    end: "2025-07-29",
    progress: 50,
    dependencies: []
  },
  {
    id: "task-3",
    name: "Testing",
    start: "2025-07-28",
    end: "2025-08-01",
    progress: 0,
    dependencies: ["task-2:FF-1d"]
  }
];

export default tasks;
