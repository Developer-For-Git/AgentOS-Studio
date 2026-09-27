const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec, spawn } = require('child_process');

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

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1180,
        height: 800,
        minWidth: 1000,
        minHeight: 650,
        backgroundColor: '#0c0e14',
        title: 'AgentOS Studio',
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

// IPC Handlers
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
    const p = targetPath || workspaceDir;
    exec(`code "${p}"`, (err) => {
        if (err) shell.openPath(p);
    });
    return true;
});

ipcMain.handle('open-terminal', () => {
    exec(`start "" "${path.join(aiosRoot, 'agentos.bat')}"`);
    return true;
});

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
