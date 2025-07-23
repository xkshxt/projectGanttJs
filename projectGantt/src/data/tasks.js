const tasks = [];

const baseDate = new Date();
for (let i = 0; i < 100; i++) {
  const start = new Date(baseDate);
  start.setDate(baseDate.getDate() + i);
  const end = new Date(start);
  end.setDate(start.getDate() + Math.floor(Math.random() * 5) + 1); // 1-5 day duration

  tasks.push({
    id: `task-${i + 1}`,
    name: `Task ${i + 1}`,
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
    progress: Math.floor(Math.random() * 100),
    dependencies: [],
  });
}

export default tasks;
