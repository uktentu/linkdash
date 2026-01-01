# LinkDash

**LinkDash** is a modern, customizable, and high-performance URL dashboard designed to organize your digital life. It combines the simplicity of a local bookmark manager with powerful features like cloud synchronization, team collaboration, and a keyboard-driven command palette.

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![React](https://img.shields.io/badge/react-19.0-blue) ![Vite](https://img.shields.io/badge/vite-7.0-purple) ![Tailwind](https://img.shields.io/badge/tailwind-4.0-cyan)

## ✨ Features

*   **🗂️ Smart Organization:** Group links into categories and teams for easy access.
*   **🖐️ Drag & Drop Interface:** Fully reorderable categories and links using the DnD Kit.
*   **☁️ Cloud Sync (Firebase):** Optionally sync your dashboard across devices with secure cloud storage.
*   **👥 Team Collaboration:** Create shared dashboards for teams with secure access codes.
*   **⌨️ Command Palette:** Press `Cmd+K` (or `Ctrl+K`) to instantly search and navigate your links.
*   **🎨 Beautiful UI:** Built with Tailwind CSS v4 and Framer Motion for smooth animations and a polished look.
*   **🔐 Private & Secure:** Local-first architecture with optional encrypted cloud backups.
*   **📱 Responsive Design:** Fully optimized for desktop, tablet, and mobile.

## 🛠️ Technology Stack

*   **Frontend:** [React 19](https://react.dev/)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
*   **Animations:** [Framer Motion](https://www.framer.com/motion/)
*   **Drag & Drop:** [@dnd-kit](https://dndkit.com/)
*   **Backend / Sync:** [Firebase](https://firebase.google.com/)
*   **Icons:** [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18 or higher)
*   npm (v9 or higher)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/uktentu/linkdash.git
    cd linkdash
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```
    Open your browser and navigate to `http://localhost:5173`.

## 📦 Building for Production

To create a production-ready build:

```bash
npm run build
```

This will generate static assets in the `dist` folder, ready for deployment.

## 🚢 Deployment

The project is configured for easy deployment to **GitHub Pages**.

1.  Ensure your `vite.config.js` has the correct `base` path set.
2.  Run the deploy script:
    ```bash
    npm run deploy
    ```

This script builds the project and pushes the `dist` folder to the `gh-pages` branch.

## 🧠 Key Components

*   **`Dashboard.jsx`**: The main view managing the grid layout and global state.
*   **`CategoryCard.jsx` / `TeamCard.jsx`**: Container components for link groups.
*   **`UrlTile.jsx`**: Individual link component with hover effects and analytics hooks.
*   **`CommandPalette.jsx`**: Global search modal for keyboard accessibility.
*   **`useCloudSync.js`**: Custom hook handling the synchronization logic with Firebase.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
