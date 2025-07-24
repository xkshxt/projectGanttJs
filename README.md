# ProjectGanttJs

A modern, interactive, React-based Gantt Chart component — supporting Microsoft Project–style dependencies (FS/SS/FF), lead/lag offsets, groupings, zoom, drag, resize, and live editing.

> **GitHub:** [github.com/xkshxt/projectGanttJs](https://github.com/xkshxt/projectGanttJs)

---

## ✨ Features

- 📅 Zoomable timeline (Day/Week/Month)
- 🟪 Task bars & multi-level groups (auto color-coded)
- 🔄 Drag, resize, and schedule tasks visually
- 🎯 Dependency arrows (FS/SS/FF + lag/lead) following task bars in real time
- 🖱️ Click any task bar to pop up a modal for instant editing
- ⚡ Smooth and responsive even for large projects
- 🎨 Fully themeable and desktop-friendly

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

3. **Try editing tasks, resizing bars, moving tasks, and exploring zoom!**

## 📁 Structure

- `src/App.jsx`: Main Gantt component (UI, logic, and modal)
- `src/tasksData.js`: Example/mock project tasks
- `src/index.css`: Main styles (sidebar, Gantt, theme, drag, zoom)

## 🎨 Customizing

- To change bar colors for groups, edit the `GROUP_COLORS` mapping in `App.jsx`.
- Add your own tasks to `src/tasksData.js`, following the example structure for groups and dependencies.
- All taskbar text is set to white for maximum readability; no matter the bar color.

## 🖥️ Responsiveness

- Designed primarily for desktop and wide-screen browsers, just like pro project management tools.
- The Gantt area stretches to fill the browser window, and the sidebar remains fixed.
- You can scroll horizontally for long periods/projects, and vertically for many tasks.
- For tablet/mobile adaptation, additional responsive CSS and touch gesture support would be needed.

## 🛠️ Technologies Used

- [React](https://reactjs.org/)
- SVG for Gantt chart visualization
- Plain CSS (no external dependencies required for visual/core logic)
- Vite for dev server and build

## 📦 Building For Production

To build for production (static files in `dist/`):

```bash
npm run build
To preview the production build locally:


npm run preview


🧑‍💻 Contributing
PRs are welcome! Open an issue for feedback, bugs, or features.

- Fork the repo
- Make your feature changes (preferably in a topic branch)
- Submit a Pull Request with a clear explanation


📚 License
MIT License
© xkshxt/projectGanttJs