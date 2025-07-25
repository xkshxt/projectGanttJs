---

# ProjectGanttJs

A modern, interactive, React-based Gantt Chart component — supporting Microsoft Project–style dependencies (FS/SS/FF), lead/lag offsets, groupings, zoom, drag, resize, and live editing.

> **GitHub:** [github.com/xkshxt/projectGanttJs](https://github.com/xkshxt/projectGanttJs)

---

## ✨ Features

- 📅 Zoomable timeline (Day/Week/Month)
- 🟪 Task bars with multi-level, color-coded groups (Planning, Creative, SEO, Development, Ad Campaigns, Launch, Support)
- 🔄 Drag and resize to schedule tasks visually
- 🔀 Fully editable, complex dependencies (FS/SS/FF, with lead/lag), visual arrows update live as you drag/resize
- 🖱️ Click task bars to open a modal for fast editing
- ⚡ Smooth and responsive for up to 150+ tasks in a realistic dataset
- 📏 Sticky always-visible horizontal scrollbar for timeline navigation
- 🧭 **Synchronized vertical scrolling**—scrolling the sidebar or chart keeps rows locked/aligned
- 🎨 Fully themeable (dark mode by default), desktop-optimized

---

## 🚀 Getting Started

1. **Clone and install:**
    ```bash
    git clone https://github.com/xkshxt/projectGanttJs.git
    cd projectGanttJs
    npm install
    ```
2. **Run the dev server:**
    ```bash
    npm run dev
    ```
    The app will open in your browser at [http://localhost:5173/](http://localhost:5173/)

3. **Explore the demo:**
    - Try zooming (Day/Week/Month), dragging and resizing bars, editing tasks, and watching dependency arrows update in real time.
    - 150-task dataset included by default for performance testing and demo realism.

---

## 📁 Structure

- `src/App.jsx`: **Main Gantt component**—UI, interactivity, modal, scroll sync
- `src/tasksData.js`: **Sample project**—150 tasks across 6 realistic color-coded groups, with FS/SS/FF dependencies, lags/leads
- `src/index.css`: Main styles for theme, group colors, scrollbars, chart/table layout

---

## 🎨 Customizing

- To change group colors, edit the `GROUP_COLORS` object in `App.jsx`.
- Add/edit tasks or groups in `src/tasksData.js`. Each task can belong to a group, and use multiple dependency types and lags/leads.
- Sidebar and chart are always in sync for pro-grade navigation.
- Sticky horizontal scroller ensures easy navigation of wide/long projects.

---

## 🖥️ Responsiveness & Experience

- Designed for **desktop/wide screens** (like MS Project and pro PM tools)
- The sidebar remains fixed; vertical and horizontal scroll behave just like commercial Gantt apps
- Large projects (100+ tasks) remain smooth thanks to efficient SVG and React state logic

---

## 🛠️ Technologies Used

- [React](https://reactjs.org/)
- SVG for Gantt visualization and arrows
- Plain CSS (no external visual libraries)
- Vite for dev/build

---

## 📦 Building For Production

To build for production:
```bash
npm run build
```
To preview the production build locally:
```bash
npm run preview
```

---

## 🧑‍💻 Contributing

PRs are welcome! Open an issue for feedback, bugs, or features.

- Fork the repo
- Make your changes (feature branch preferred)
- Submit a Pull Request with a clear description

---

## 📚 License

MIT License  
© xkshxt/projectGanttJs

---