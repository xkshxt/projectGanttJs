// --- save this as make_tasks_data.js --- //
const fs = require('fs');

let initialTasks = [];
let numGroups = 40;
let tasksPerGroup = 24;
let taskId = 1;

for (let g = 1; g <= numGroups; ++g) {
  let gid = `g${g}`;
  let groupName = `Group ${g}`;
  let children = [];
  for (let t = 1; t <= tasksPerGroup; ++t) {
    let tid = (taskId++).toString();
    let daysStart = ((g-1) * 10) + t;
    let daysEnd = daysStart + Math.floor(Math.random()*7)+1;
    children.push(tid);
    initialTasks.push({
      id: tid,
      name: `Task ${tid}`,
      start: `2022-03-${(daysStart%30+1).toString().padStart(2,"0")}`,
      end: `2022-03-${(daysEnd%30+1).toString().padStart(2,"0")}`,
      dependencies: 
        t === 1
          ? []
          : [{ type: "FS", taskId: (taskId-2).toString(), lag: Math.floor(Math.random()*3) }],
      parent: gid
    });
  }
  initialTasks.push({
    id: gid,
    name: groupName,
    isGroup: true,
    children,
    expanded: true,
  });
}

// Write to file:
fs.writeFileSync('tasksDataDump.js', 'const initialTasks = ' + JSON.stringify(initialTasks, null, 2) + ';\nexport default initialTasks;\n');
console.log("Wrote 1000+ entries to tasksDataDump.js. Copy it into your project as tasksData.js");