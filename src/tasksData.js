const initialTasks = [
  { id: "1", name: "Define KPIs", start: "2022-03-28", end: "2022-03-28", dependencies: [] },
  
  { id: "2", name: "Evaluate Customer Segments", start: "2022-03-29", end: "2022-04-05", dependencies: [
      { type: "FS", taskId: "1", lag: 0 }
    ]
  },

  { id: "3", name: "Develop Strategy Plan", start: "2022-04-06", end: "2022-04-12", dependencies: [
      { type: "FS", taskId: "2", lag: 0 }
    ]
  },

  { id: "4", name: "Design Marketing Campaign", start: "2022-04-13", end: "2022-04-20", dependencies: [
      { type: "FS", taskId: "3", lag: 0 }
    ]
  },

  { id: "5", name: "Set Up Analytics Tools", start: "2022-04-07", end: "2022-04-10", dependencies: [
      { type: "FS", taskId: "2", lag: 0 }
    ]
  },

  { id: "6", name: "Develop Website", start: "2022-04-15", end: "2022-04-25", dependencies: [
      { type: "FS", taskId: "4", lag: 0 }
    ]
  },

  { id: "7", name: "Run User Testing", start: "2022-04-26", end: "2022-05-01", dependencies: [
      { type: "FS", taskId: "6", lag: 0 }
    ]
  },

  { id: "8", name: "Launch Product", start: "2022-05-02", end: "2022-05-03", dependencies: [
      { type: "FS", taskId: "7", lag: 0 }
    ]
  },

  { id: "9", name: "Collect User Feedback", start: "2022-05-04", end: "2022-05-10", dependencies: [
      { type: "FS", taskId: "8", lag: 0 }
    ]
  },

  { id: "10", name: "Analyze Feedback", start: "2022-05-11", end: "2022-05-14", dependencies: [
      { type: "FS", taskId: "9", lag: 0 }
    ]
  },

  { id: "11", name: "Iterate on Features", start: "2022-05-15", end: "2022-05-20", dependencies: [
      { type: "FS", taskId: "10", lag: 0 }
    ]
  },

  { id: "12", name: "Final QA & Review", start: "2022-05-21", end: "2022-05-23", dependencies: [
      { type: "FS", taskId: "11", lag: 0 }
    ]
  }
];

export default initialTasks;
