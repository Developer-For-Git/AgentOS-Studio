const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec, spawn } = require('child_process');
const store = require('./agentos-store');

let mainWindow;

const aiosRoot = path.resolve(__dirname, '..');
const workspaceDir = path.join(aiosRoot, 'workspace');
const projectsDir = path.join(workspaceDir, 'projects');
const backupsDir = path.join(aiosRoot, 'backups');
const scriptsDir = path.join(aiosRoot, 'scripts');

function ensureDirectories() {
    if (!fs.existsSync(projectsDir)) fs.mkdirSync(projectsDir, { recursive: true });
    if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });
}

if (process.platform === 'win32') {
    app.setAppUserModelId('com.agentos.studio');
}

function createWindow() {
    const iconPath = fs.existsSync(path.join(__dirname, 'icon.ico')) 
        ? path.join(__dirname, 'icon.ico') 
        : path.join(__dirname, '..', 'assets', 'icon.ico');

    mainWindow = new BrowserWindow({
        width: 1220,
        height: 840,
        minWidth: 1040,
        minHeight: 700,
        backgroundColor: '#0c0e14',
        title: 'AgentOS Studio',
        icon: iconPath,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        },
        autoHideMenuBar: true,
        show: false
    });

    mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.webContents.on('did-finish-load', () => {
        // Window loaded and ready
    });
}

app.whenReady().then(() => {
    ensureDirectories();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// Helper to run commands
function runCmd(cmd) {
    return new Promise((resolve) => {
        exec(cmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
            resolve({
                success: !err,
                stdout: stdout || '',
                stderr: stderr || '',
                error: err ? err.message : null
            });
        });
    });
}

// Editor Detection Engine
function getInstalledEditors() {
    const localAppData = process.env.LOCALAPPDATA || '';
    const programFiles = process.env.ProgramFiles || '';
    const candidates = [
        {
            id: 'antigravity-ide',
            name: 'Antigravity IDE',
            badge: 'DeepMind',
            icon: 'rocket',
            paths: [
                path.join(localAppData, 'Programs', 'Antigravity IDE', 'Antigravity IDE.exe'),
                path.join(localAppData, 'Programs', 'antigravity', 'Antigravity.exe')
            ]
        },
        {
            id: 'antigravity-cli',
            name: 'Antigravity CLI (agy)',
            badge: 'CLI Agent',
            icon: 'terminal',
            paths: [
                path.join(localAppData, 'agy', 'bin', 'agy.exe')
            ]
        },
        {
            id: 'vscode',
            name: 'VS Code',
            badge: 'IDE',
            icon: 'code',
            paths: [
                path.join(localAppData, 'Programs', 'Microsoft VS Code', 'bin', 'code.cmd'),
                path.join(localAppData, 'Programs', 'Microsoft VS Code', 'Code.exe'),
                path.join(programFiles, 'Microsoft VS Code', 'bin', 'code.cmd')
            ]
        },
        {
            id: 'cursor',
            name: 'Cursor Pro',
            badge: 'AI IDE',
            icon: 'cursor',
            paths: [
                path.join(localAppData, 'Programs', 'cursor', 'Cursor.exe'),
                path.join(localAppData, 'cursor', 'Cursor.exe')
            ]
        },
        {
            id: 'kilocode',
            name: 'Kilo Code',
            badge: 'AI IDE',
            icon: 'cpu',
            paths: [
                path.join(localAppData, 'Programs', 'kilocode', 'kilocode.exe'),
                path.join(localAppData, 'kilocode', 'kilocode.exe')
            ]
        },
        {
            id: 'windsurf',
            name: 'Windsurf',
            badge: 'AI IDE',
            icon: 'wind',
            paths: [
                path.join(localAppData, 'Programs', 'Windsurf', 'Windsurf.exe')
            ]
        }
    ];

    const installed = [];
    for (const cand of candidates) {
        let foundPath = null;
        for (const p of cand.paths) {
            if (fs.existsSync(p)) {
                foundPath = p;
                break;
            }
        }
        if (foundPath) {
            installed.push({
                id: cand.id,
                name: cand.name,
                badge: cand.badge,
                icon: cand.icon,
                path: foundPath
            });
        }
    }
    return installed;
}

function openEditor(editorId, targetPath) {
    const editors = getInstalledEditors();
    const ed = editors.find(e => e.id === editorId);
    const p = targetPath || workspaceDir;

    if (!ed) {
        shell.openPath(p);
        return true;
    }

    if (ed.id === 'antigravity-cli') {
        exec(`start cmd.exe /k "cd /d \"${p}\" && agy"`);
        return true;
    }

    if (ed.path.endsWith('.cmd') || ed.path.endsWith('.bat')) {
        exec(`"${ed.path}" "${p}"`);
        return true;
    }

    try {
        spawn(ed.path, [p], { detached: true, stdio: 'ignore' }).unref();
    } catch (e) {
        exec(`"${ed.path}" "${p}"`);
    }
    return true;
}

// IPC Handlers - System & Core
ipcMain.handle('get-system-status', async () => {
    const res = await runCmd('wsl.exe -d AgentOS agentos info');
    let memory = '11 GB';
    let memUsed = '750 MB';
    let memPercent = 7;
    let isSecure = true;

    if (res.stdout) {
        if (!res.stdout.includes('Host C: drive is UNMOUNTED')) {
            isSecure = false;
        }

        const lines = res.stdout.split('\n');
        for (const line of lines) {
            if (line.startsWith('Mem:')) {
                const parts = line.trim().split(/\s+/);
                if (parts.length >= 3) {
                    memory = parts[1];
                    memUsed = parts[2];
                }
            }
        }
    }

    return {
        online: res.success,
        isSecure,
        memory,
        memUsed,
        raw: res.stdout || res.stderr
    };
});

ipcMain.handle('get-partitions', async () => {
    ensureDirectories();
    const items = fs.readdirSync(projectsDir, { withFileTypes: true });
    const partitions = [];

    for (const item of items) {
        if (item.isDirectory()) {
            const pPath = path.join(projectsDir, item.name);
            const hasVenv = fs.existsSync(path.join(pPath, '.venv'));
            const hasGit = fs.existsSync(path.join(pPath, '.git'));
            const hasNode = fs.existsSync(path.join(pPath, 'package.json'));
            const stats = fs.statSync(pPath);

            let stack = [];
            if (hasVenv) stack.push('Python (venv)');
            if (hasNode) stack.push('Node.js');
            if (hasGit) stack.push('Git');
            if (stack.length === 0) stack.push('Custom');

            partitions.push({
                name: item.name,
                path: pPath,
                stack: stack.join(' • '),
                createdAt: stats.birthtime ? stats.birthtime.toISOString() : stats.mtime.toISOString(),
                hasVenv,
                hasGit,
                hasNode
            });
        }
    }

    return partitions;
});

ipcMain.handle('create-partition', async (event, { name, template }) => {
    const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '');
    if (!safeName) return { success: false, error: 'Invalid name' };

    const cmd = `wsl.exe -d AgentOS agentos new ${safeName}`;
    const res = await runCmd(cmd);

    if (template === 'node' || template === 'fullstack') {
        await runCmd(`wsl.exe -d AgentOS --cd /workspace/projects/${safeName} npm init -y`);
    }

    // Initialize Project Brain
    store.getProjectBrain(safeName);

    return { success: res.success, output: res.stdout || res.stderr };
});

ipcMain.handle('delete-partition', async (event, name) => {
    const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '');
    const res = await runCmd(`wsl.exe -d AgentOS agentos delete ${safeName}`);
    return { success: res.success };
});

ipcMain.handle('open-explorer', (event, targetPath) => {
    const p = targetPath || workspaceDir;
    shell.openPath(p);
    return true;
});

ipcMain.handle('open-code', (event, targetPath) => {
    return openEditor('vscode', targetPath);
});

ipcMain.handle('open-terminal', () => {
    exec(`start "" "${path.join(aiosRoot, 'agentos.bat')}"`);
    return true;
});

// Dynamic Editor IPC
ipcMain.handle('get-installed-editors', () => {
    return getInstalledEditors();
});

ipcMain.handle('open-editor', (event, { editorId, targetPath }) => {
    return openEditor(editorId, targetPath);
});

// Command Runner
ipcMain.handle('run-command', async (event, { command, workingDir, asRoot }) => {
    const dir = workingDir || '/workspace';
    const sudoFlag = asRoot ? '-u root ' : '';
    const escaped = command.replace(/"/g, '\\"');
    const fullCmd = `wsl.exe -d AgentOS ${sudoFlag}--cd "${dir}" bash -lc "${escaped}"`;
    const res = await runCmd(fullCmd);
    return {
        success: res.success,
        output: (res.stdout + (res.stderr ? '\n' + res.stderr : '')).trim()
    };
});

// Tool Store
ipcMain.handle('install-tool', async (event, toolKey) => {
    let installCmd = '';
    switch (toolKey) {
        case 'aws':
            installCmd = 'agentos install-cli aws';
            break;
        case 'supabase':
            installCmd = 'sudo npm install -g supabase';
            break;
        case 'stripe':
            installCmd = 'agentos install-cli stripe';
            break;
        case 'redis':
            installCmd = 'sudo apt-get install -y redis-server';
            break;
        case 'postgres':
            installCmd = 'sudo apt-get install -y postgresql postgresql-contrib';
            break;
        case 'podman':
            installCmd = 'sudo apt-get install -y podman';
            break;
        default:
            return { success: false, error: 'Unknown tool' };
    }

    const res = await runCmd(`wsl.exe -d AgentOS bash -lc "${installCmd}"`);
    return { success: res.success, output: res.stdout || res.stderr };
});

// Snapshots
ipcMain.handle('get-snapshots', async () => {
    ensureDirectories();
    const files = fs.readdirSync(backupsDir);
    const snapshots = [];

    for (const f of files) {
        if (f.endsWith('.tar')) {
            const fPath = path.join(backupsDir, f);
            const stats = fs.statSync(fPath);
            snapshots.push({
                name: f,
                path: fPath,
                sizeMB: (stats.size / (1024 * 1024)).toFixed(1),
                createdAt: stats.mtime.toISOString()
            });
        }
    }
    return snapshots;
});

ipcMain.handle('create-snapshot', async (event, name) => {
    ensureDirectories();
    let sName = name ? name.trim().replace(/[^a-zA-Z0-9_-]/g, '') : `snapshot-${Date.now()}`;
    if (!sName.endsWith('.tar')) sName += '.tar';
    const dest = path.join(backupsDir, sName);

    await runCmd('wsl.exe -t AgentOS');
    const res = await runCmd(`wsl.exe --export AgentOS "${dest}"`);
    return { success: res.success, path: dest };
});

ipcMain.handle('restore-snapshot', async (event, snapshotPath) => {
    const resetScript = path.join(scriptsDir, 'reset-agentos.ps1');
    const cmd = `powershell.exe -ExecutionPolicy Bypass -File "${resetScript}" -FromBackup "${snapshotPath}" -Force`;
    const res = await runCmd(cmd);
    return { success: res.success, output: res.stdout || res.stderr };
});

ipcMain.handle('restart-os', async () => {
    await runCmd('wsl.exe -t AgentOS');
    await runCmd('wsl.exe -d AgentOS true');
    return { success: true };
});

// --- Todos / Live Task Tracker IPC ---
ipcMain.handle('get-todos', () => {
    return store.getTodos();
});

ipcMain.handle('update-todo', (event, { id, updates }) => {
    return store.updateTodo(id, updates);
});

// --- Skills IPC ---
ipcMain.handle('get-skills', () => {
    return store.getSkills();
});

ipcMain.handle('toggle-skill', (event, { id, field, value }) => {
    return store.toggleSkill(id, field, value);
});

ipcMain.handle('toggle-skill-for-project', (event, { skillId, projectName }) => {
    return store.toggleSkillForProject(skillId, projectName);
});

ipcMain.handle('create-skill', (event, skillData) => {
    return store.createSkill(skillData);
});

ipcMain.handle('get-skills-sh-registry', () => {
    return store.getSkillsShRegistry();
});

ipcMain.handle('install-skill-from-registry', (event, skillId) => {
    return store.installSkillFromRegistry(skillId);
});

ipcMain.handle('batch-toggle-skills', (event, { action, category }) => {
    return store.batchToggleSkills(action, category);
});

ipcMain.handle('fetch-custom-skill', (event, input) => {
    return store.fetchCustomSkill(input);
});

// --- MCP IPC ---
ipcMain.handle('get-mcp-servers', () => {
    return store.getMcpServers();
});

ipcMain.handle('update-mcp-project-access', (event, { serverId, projectName, accessLevel }) => {
    return store.updateMcpProjectAccess(serverId, projectName, accessLevel);
});

ipcMain.handle('toggle-mcp-server-status', (event, { serverId, status }) => {
    return store.toggleMcpServerStatus(serverId, status);
});

ipcMain.handle('create-mcp-server', (event, mcpData) => {
    return store.createMcpServer(mcpData);
});

// --- Plugins IPC ---
ipcMain.handle('get-plugins', () => {
    return store.getPlugins();
});

ipcMain.handle('toggle-plugin', (event, pluginId) => {
    return store.togglePlugin(pluginId);
});

ipcMain.handle('create-plugin', (event, pluginData) => {
    return store.createPlugin(pluginData);
});

// --- Custom Package Installation IPC ---
ipcMain.handle('install-custom-tool', async (event, { manager, packageName }) => {
    const cleanPkg = (packageName || '').replace(/[^a-zA-Z0-9_\-@\.\/]/g, '');
    if (!cleanPkg) return { success: false, error: 'Invalid package name' };

    let cmd = '';
    switch (manager) {
        case 'apt':
            cmd = `sudo apt-get update && sudo apt-get install -y ${cleanPkg}`;
            break;
        case 'npm':
            cmd = `sudo npm install -g ${cleanPkg}`;
            break;
        case 'pip':
            cmd = `pip3 install --break-system-packages ${cleanPkg}`;
            break;
        case 'cargo':
            cmd = `cargo install ${cleanPkg}`;
            break;
        case 'go':
            cmd = `go install ${cleanPkg}@latest`;
            break;
        default:
            cmd = `sudo apt-get install -y ${cleanPkg}`;
    }

    const res = await runCmd(`wsl.exe -d AgentOS bash -lc "${cmd}"`);
    return { success: res.success, output: res.stdout || res.stderr, packageName: cleanPkg };
});

// --- Project Brain IPC ---
ipcMain.handle('get-project-brain', (event, projectName) => {
    return store.getProjectBrain(projectName);
});

ipcMain.handle('add-brain-memory', (event, { projectName, memory }) => {
    return store.addBrainMemory(projectName, memory);
});

ipcMain.handle('delete-brain-memory', (event, { projectName, memoryId }) => {
    return store.deleteBrainMemory(projectName, memoryId);
});

ipcMain.handle('get-brain-graph', (event, projectName) => {
    return store.getBrainGraph(projectName);
});

ipcMain.handle('export-brain-obsidian', (event, { projectName, targetDir }) => {
    return store.exportBrainObsidian(projectName, targetDir);
});

ipcMain.handle('get-external-brain-tools', (event, projectName) => {
    return store.getExternalBrainTools(projectName);
});

ipcMain.handle('connect-external-brain-tool', (event, { projectName, toolData }) => {
    return store.connectExternalBrainTool(projectName, toolData);
});

ipcMain.handle('disconnect-external-brain-tool', (event, { projectName, toolId }) => {
    return store.disconnectExternalBrainTool(projectName, toolId);
});

// --- Screenshot Capture IPC ---
ipcMain.handle('capture-screen', async (event, filename) => {
    try {
        if (!mainWindow) return { success: false, error: 'No window' };
        const image = await mainWindow.webContents.capturePage();
        const fname = filename || 'screenshot_latest.png';
        const targetPath = path.join(app.getPath('userData'), fname);
        fs.writeFileSync(targetPath, image.toPNG());
        return { success: true, path: targetPath };
    } catch (e) {
        return { success: false, error: e.message };
    }
});
