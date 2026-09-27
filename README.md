# AgentOS Studio 🤖🛡️

> **Next-Generation Isolated Sub-Operating System & Modern Desktop Environment for Autonomous AI Agents**

[![Platform](https://img.shields.io/badge/Platform-Windows%2010%20%7C%2011-blue?style=flat-square&logo=windows)](https://microsoft.com/windows)
[![Tech Stack](https://img.shields.io/badge/Stack-Electron%20%7C%20Node.js%2022%20%7C%20WSL2-6366f1?style=flat-square)](https://electronjs.org)
[![Security](https://img.shields.io/badge/Security-100%25%20Host%20Drive%20Isolated-10b981?style=flat-square)](https://github.com/Developer-For-Git/AgentOS-Studio)

---

## 🌟 The Vision: Why AgentOS Studio Was Born

The greatest challenge with autonomous AI coding agents (such as AutoGPT, OpenHands, SWE-agent, Aider, and custom LLM runners) is **safety**. 

Giving an AI agent raw command-line access to your personal Windows machine is dangerous:
* An agent can run destructive commands like `rm -rf /` or overwrite system files.
* It can read private credentials, SSH keys, browser cookies, and personal documents.
* It can install incompatible or broken system packages that ruin your host development setup.

**AgentOS Studio** solves this completely by giving the agent its own **sandboxed, containerized Sub-Operating System** (Ubuntu 24.04 LTS via a dedicated WSL2 MicroVM) with a **gorgeous desktop application** built with the same technology stack as **Google Antigravity and VS Code**.

---

## 🛡️ The Zero-Trust Security Firewall

```
+-------------------------------------------------------------+
|                     HOST WINDOWS PC                         |
|  [Personal Files] [Desktop] [Browser Data] [C:\ System]     |
|                              |                              |
|                   ❌ HARDWARE BARRIER ❌                    |
|      (automount=false | appendWindowsPath=false)            |
|                              |                              |
|  +---------------------------v---------------------------+  |
|  |                 AGENTOS SANDBOX (WSL2)                |  |
|  |  • Ubuntu 24.04 LTS (Isolated Virtual Disk ext4.vhdx) |  |
|  |  • Full root/sudo rights for AI agent                 |  |
|  |  • Pre-installed: Python 3.12, Node 22, Git, gh       |  |
|  |  • Shared Gateway: Only /workspace is mounted        |  |
|  +-------------------------------------------------------+  |
+-------------------------------------------------------------+
```

1. **Drive Blackout (`automount = false`):** Host drives `C:\` and `D:\` are **completely unmounted**. If an agent looks for `/mnt/c`, it sees an empty directory.
2. **Binary Blocking (`appendWindowsPath = false`):** Windows executables (`cmd.exe`, `powershell.exe`) are blocked from the Linux PATH, preventing jailbreaks.
3. **Contained Blast Radius:** Even if an agent destroys the guest OS filesystem, your host PC is untouched. A full OS restore takes 10 seconds.
4. **Shared Workspace Gateway:** Only the designated project directory is shared and synced immediately to your Windows Desktop.

---

## 🚀 The Evolution: Why We Ditched Legacy WinForms

Our initial prototype used **C# Windows Forms (WinForms)**. The experience was frustrating:
* Rigid, blocky 2000s-era UI with no smooth animations.
* Pixelated GDI fonts that clipped on High-DPI screens.
* Text overflow and truncated buttons.

### The Transformation
We completely rebuilt the desktop application from the ground up using **Electron + Node.js + Modern Dark CSS Glassmorphism**—the exact same engineering architecture behind **Google Antigravity, VS Code, and Cursor**:

| Feature | Legacy WinForms | AgentOS Studio (Electron) |
| :--- | :--- | :--- |
| **Rendering Engine** | 2001 GDI Graphics | **Chromium with GPU Hardware Acceleration** |
| **Theme & Polish** | Flat, blocky buttons | **Linear / Antigravity Dark Glassmorphism** |
| **Animations** | 0 fps (Static) | **Smooth 60fps CSS transitions, hover lifts, glowing badges** |
| **Typography** | Generic pixelated fonts | **Hardware-antialiased Plus Jakarta Sans & JetBrains Mono** |
| **Layout** | Fixed pixel coordinates | **Responsive Auto-Fit Flexbox & CSS Grid** |

---

## 🎛️ What You Can Do in AgentOS Studio

### 1. 🏠 Health & Isolation Dashboard
* Live monitoring of Linux kernel health, memory allocation, and virtual disk size.
* Visual **Host Protection Shield** verifying the C: drive lockout.
* Quick actions to open the workspace in Windows Explorer, launch the terminal, or restart the container.

### 2. 📂 Visual Application Partitions
* Visually create new application partitions with 1 click:
  * **Python 3.12** (auto-creates `.venv` + Git + structure)
  * **Node.js 22 LTS** (auto-creates `package.json` + Git)
  * **Fullstack** (Python + Node.js)
  * **Blank**
* 1-Click buttons to **Open in VS Code**, **Open in Explorer**, or **Delete**.

### 3. 🛒 1-Click Tool Store
Install developer tools directly into the isolated sandbox without polluting your Windows environment:
* ⚡ **AWS CLI v2** (Cloud infrastructure)
* ⚡ **Supabase CLI** (PostgreSQL, Auth, and Edge Functions)
* ⚡ **Stripe CLI** (Payment webhook testing)
* ⚡ **Redis Server** (In-memory caching and queues)
* ⚡ **PostgreSQL** (Enterprise database)
* ⚡ **Docker / Podman** (OCI container runtime)

### 4. 💻 Sandbox Console Runner
* Run scripts and commands safely with real-time streaming output.
* Quick preset diagnostic buttons (`Health Check`, `Python Info`, `Node Info`, `Git status`, `Disk Space`).
* 1-Click copy button for instant debugging with LLM agents.

### 5. 🔄 1-Click Safety Snapshots & Rollback
* Take a snapshot before running complex agent workflows.
* If an agent breaks dependencies or installs conflicting packages, restore the OS back to pristine state in seconds while preserving all project files.

---

## ⚡ 1-Click Installation (For Any Windows PC)

To deploy **AgentOS Studio** on any new Windows machine:

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

The script automatically:
1. Verifies/enables WSL2.
2. Checks/installs Node.js LTS via winget.
3. Downloads the clean Ubuntu 24.04 rootfs and imports `AgentOS`.
4. Applies security isolation rules and creates the default `agent` user.
5. Deploys the modern Electron desktop app and places the **AgentOS** shortcut on your Desktop.

---

## 📁 Repository Structure

```
├── desktop/                 # Electron Desktop Application (Google Antigravity Stack)
│   ├── main.js              # Main process (WSL2 IPC bridges & process managers)
│   ├── preload.js           # Secure contextBridge API
│   ├── package.json         # Electron dependencies
│   └── renderer/            # Modern Glassmorphism Frontend
│       ├── index.html       # Responsive application layout
│       ├── styles.css       # 60fps transitions, dark theme, SVG icons
│       └── app.js           # Frontend interactivity & real-time polling
├── scripts/                 # Core PowerShell & Bash automation scripts
│   ├── agentos-cli.sh       # In-OS partition manager CLI
│   ├── exec-agentos.ps1     # Headless command execution script
│   ├── status-agentos.ps1   # Terminal status monitor
│   ├── backup-agentos.ps1   # Distro snapshot creator
│   └── reset-agentos.ps1    # Clean factory reset script
├── install.ps1              # 1-Click automated master installer
├── agentos.bat              # Standalone terminal launcher
├── launch-agentos-studio.bat# Instant Electron app launcher
└── README.md                # Documentation & Architecture Guide
```

---

## 📄 License
MIT License. Built for developers and AI agents to work together in total security.
