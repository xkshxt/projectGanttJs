# 📊 React Gantt Chart

An interactive Gantt chart built using **React**, designed to visualize and manage task timelines, dependencies, and progress. Supports drag-and-drop, task resizing, dependency arrows, and smooth performance with 100+ tasks.

---

## 🚀 Features

- ✅ Zoom levels: Day / Week / Month views
- ✅ Scrollable timeline and compact task rows
- ✅ Drag-and-drop tasks along the timeline
- ✅ Resizable task bars with 1-day minimum duration
- ✅ Live task editing modal (name, date, progress)
- ✅ Dependency arrows with FS, SS, FF types and lag/lead offsets
- ✅ Auto-scroll to today's date on load
- ✅ Handles 100+ tasks efficiently

---

## 📁 Project Structure

```

project-root/
├── public/
├── src/
│   ├── components/
│   │   ├── GanttChart.jsx
│   │   ├── EditModal.jsx
│   │   └── DependencyArrow\.jsx
│   ├── data/
│   │   └── tasks.js
│   ├── styles/
│   │   ├── gantt.css
│   │   └── modal.css
│   └── main.jsx
├── README.md
├── package.json
└── vite.config.js

````

---

## 🛠️ Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/xkshxt/projectGanttJs.git
cd gantt-chart-react
````

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the App

```bash
npm run dev
```

The app will be available at: `http://localhost:5173`

---

## 🔧 Tech Stack

* React (with hooks)
* Vite (for fast development)
* CSS (no external UI libraries)

---

## 📌 Notes

* Timeline zoom and scroll are optimized for smooth use with large task lists.
* Future enhancements could include:

  * Task groupings or swimlanes
  * Export to PDF/image
  * Better visual hierarchy (indentation or color coding)

---

## 📬 Contact

For any questions, reach out at: **\[[akshj0203@gmail.com](mailto:akshj0203@gmail.com)]**
