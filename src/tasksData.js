const initialTasks = [
  // --- Planning group ---
  { id: "g1", name: "Planning", isGroup: true, children: ["1","2","3","4","10"], expanded: true },
  { id: "1", name: "Define KPIs", start: "2022-03-28", end: "2022-03-28", dependencies: [], parent: "g1" },
  { id: "2", name: "Evaluate Customer Segments", start: "2022-03-29", end: "2022-04-05", dependencies: [{ type: "FS", taskId: "1", lag: 0 }], parent: "g1" },
  { id: "3", name: "Develop Strategy Plan", start: "2022-04-06", end: "2022-04-12", dependencies: [{ type: "FS", taskId: "2", lag: 1 }], parent: "g1" }, // <-- 1 day lag
  { id: "4", name: "Design Marketing Campaign", start: "2022-04-13", end: "2022-04-20", dependencies: [{ type: "FS", taskId: "3", lag: 0 }], parent: "g1" },
  { id: "10", name: "Budget Approval", start: "2022-04-14", end: "2022-04-19", dependencies: [
    { type: "SS", taskId: "4", lag: 2 }
  ], parent: "g1" },

  // --- Creative group ---
  { id: "g2", name: "Creative", isGroup: true, children: ["5","6","7","11"], expanded: true },
  { id: "5", name: "Set Up Analytics Tools", start: "2022-04-07", end: "2022-04-10", dependencies: [{ type: "FS", taskId: "2", lag: 0 }], parent: "g2" },
  { id: "6", name: "Develop Website", start: "2022-04-15", end: "2022-04-25", dependencies: [{ type: "FS", taskId: "4", lag: 3 }], parent: "g2" }, // <-- 3 day lag
  { id: "7", name: "Run User Testing", start: "2022-04-26", end: "2022-05-01", dependencies: [{ type: "FS", taskId: "6", lag: 0 }], parent: "g2" },
  { id: "11", name: "Brand Asset Design", start: "2022-04-17", end: "2022-04-20", dependencies: [
    { type: "SS", taskId: "4", lag: -1 }
  ], parent: "g2" }, // <-- SS-1d, starts 1 day before Design Marketing Campaign

  // --- Launch group ---
  { id: "g3", name: "Launch", isGroup: true, children: ["8","9"], expanded: true },
  { id: "8", name: "Launch Product", start: "2022-05-02", end: "2022-05-03", dependencies: [
    { type: "FS", taskId: "7", lag: 1 }, // <-- 1 day lag
    { type: "FF", taskId: "6", lag: 0 }
  ], parent: "g3" },
  { id: "9", name: "Collect User Feedback", start: "2022-05-04", end: "2022-05-10", dependencies: [{ type: "FS", taskId: "8", lag: 0 }], parent: "g3" },

  // --- SEO group ---
  { id: "g4", name: "SEO", isGroup: true, children: ["12","13","14"], expanded: true },
  { id: "12", name: "Keyword Research", start: "2022-03-29", end: "2022-04-02", dependencies: [{ type: "FS", taskId: "1", lag: 1 }], parent: "g4" },
  { id: "13", name: "Content Plan", start: "2022-04-03", end: "2022-04-07", dependencies: [{ type: "FS", taskId: "12", lag: 0 }], parent: "g4" },
  { id: "14", name: "On-page Optimization", start: "2022-04-09", end: "2022-04-20", dependencies: [{ type: "FS", taskId: "13", lag: 0 }], parent: "g4" },

  // --- Development group ---
  { id: "g5", name: "Development", isGroup: true, children: ["15","16","17","18"], expanded: true },
  { id: "15", name: "Wireframes", start: "2022-03-30", end: "2022-03-31", dependencies: [], parent: "g5" },
  { id: "16", name: "Front-End Module 1", start: "2022-04-01", end: "2022-04-06", dependencies: [{ type: "FS", taskId: "15", lag: 0 }], parent: "g5" },
  { id: "17", name: "Front-End Module 2", start: "2022-04-07", end: "2022-04-12", dependencies: [{ type: "FS", taskId: "16", lag: 0 }], parent: "g5" },
  { id: "18", name: "Back-End API", start: "2022-03-31", end: "2022-04-12", dependencies: [{ type: "FS", taskId: "15", lag: 2 }], parent: "g5" },

 
];
export default initialTasks;