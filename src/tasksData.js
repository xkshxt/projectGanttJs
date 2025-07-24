const initialTasks = [
  // --- Planning group ---
  { 
    id: "g1", name: "Planning", isGroup: true, children: ["1","2","3","4"], expanded: true
  },
  { id: "1", name: "Define KPIs", start: "2022-03-28", end: "2022-03-28", dependencies: [], parent: "g1" },
  { id: "2", name: "Evaluate Customer Segments", start: "2022-03-29", end: "2022-04-05", dependencies: [
    { type: "FS", taskId: "1", lag: 0 }
  ], parent: "g1" },
  { id: "3", name: "Develop Strategy Plan", start: "2022-04-06", end: "2022-04-12", dependencies: [
    { type: "FS", taskId: "2", lag: 0 }
  ], parent: "g1" },
  { id: "4", name: "Design Marketing Campaign", start: "2022-04-13", end: "2022-04-20", dependencies: [
    { type: "FS", taskId: "3", lag: 0 }
  ], parent: "g1" },

  // --- Creative group ---
  { id: "g2", name: "Creative", isGroup: true, children: ["5","6","7"], expanded: true },
  { id: "5", name: "Set Up Analytics Tools", start: "2022-04-07", end: "2022-04-10", dependencies: [
    { type: "FS", taskId: "2", lag: 0 }
  ], parent: "g2" },
  { id: "6", name: "Develop Website", start: "2022-04-15", end: "2022-04-25", dependencies: [
    { type: "FS", taskId: "4", lag: 0 }
  ], parent: "g2" },
  { id: "7", name: "Run User Testing", start: "2022-04-26", end: "2022-05-01", dependencies: [
    { type: "FS", taskId: "6", lag: 0 }
  ], parent: "g2" },

  // --- Launch group ---
  { id: "g3", name: "Launch", isGroup: true, children: ["8","9"], expanded: true },
  { id: "8", name: "Launch Product", start: "2022-05-02", end: "2022-05-03", dependencies: [
    { type: "FS", taskId: "7", lag: 0 }
  ], parent: "g3" },
  { id: "9", name: "Collect User Feedback", start: "2022-05-04", end: "2022-05-10", dependencies: [
    { type: "FS", taskId: "8", lag: 0 }
  ], parent: "g3" },
  
];

export default initialTasks;