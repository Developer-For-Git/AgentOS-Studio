const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const aiosRoot = path.resolve(__dirname, '..');
const desktopDir = path.join(aiosRoot, 'desktop');
const assetsDir = path.join(aiosRoot, 'assets');
const previewDir = path.join(assetsDir, 'previews');
const store = require(path.join(desktopDir, 'agentos-store'));

if (!fs.existsSync(previewDir)) {
    fs.mkdirSync(previewDir, { recursive: true });
}

// Full IPC Handlers
ipcMain.handle('get-system-status', async () => ({
    online: true,
    isSecure: true,
    memory: "11 GiB",
    memUsed: "705 MiB"
}));

ipcMain.handle('get-partitions', async () => ([
    {
        name: "my-first-app",
        path: "C:\\Users\\LOL\\Desktop\\AIOS\\workspace\\projects\\my-first-app",
        stack: "Python (venv) • Git",
        hasVenv: true,
        hasNode: false,
        hasGit: true
    },
    {
        name: "space-bunny-web",
        path: "C:\\Users\\LOL\\Desktop\\AIOS\\workspace\\projects\\space-bunny-web",
        stack: "Python • Node.js • Git",
        hasVenv: true,
        hasNode: true,
        hasGit: true
    }
]));

ipcMain.handle('get-installed-editors', async () => ([
    { id: 'antigravity-ide', name: 'Antigravity IDE', badge: 'DeepMind', icon: 'rocket' },
    { id: 'antigravity-cli', name: 'Antigravity CLI (agy)', badge: 'CLI', icon: 'terminal' },
    { id: 'vscode', name: 'VS Code', badge: 'IDE', icon: 'code' },
    { id: 'cursor', name: 'Cursor Pro', badge: 'AI IDE', icon: 'cursor' }
]));

ipcMain.handle('get-todos', () => store.getTodos());
ipcMain.handle('get-skills', () => store.getSkills());
ipcMain.handle('get-skills-sh-registry', () => store.getSkillsShRegistry());
ipcMain.handle('install-skill-from-registry', (e, id) => store.installSkillFromRegistry(id));
ipcMain.handle('get-mcp-servers', () => store.getMcpServers());
ipcMain.handle('get-plugins', () => store.getPlugins());
ipcMain.handle('get-project-brain', (event, p) => store.getProjectBrain(p || 'space-bunny-web'));
ipcMain.handle('get-snapshots', async () => ([]));
ipcMain.handle('open-explorer', () => true);
ipcMain.handle('open-editor', () => true);
ipcMain.handle('run-command', () => ({ success: true, stdout: 'Done' }));

async function captureView(win, pageKey, filename, postAction) {
    await win.webContents.executeJavaScript(`
        const btn = document.querySelector('.nav-item[data-page="${pageKey}"]');
        if (btn) btn.click();
    `);
    if (postAction) {
        await win.webContents.executeJavaScript(postAction);
    }
    await new Promise(r => setTimeout(r, 1200));
    const img = await win.webContents.capturePage();
    const outPreview = path.join(previewDir, filename);
    fs.writeFileSync(outPreview, img.toPNG());
    console.log(`Saved preview: ${filename}`);
    return img;
}

app.whenReady().then(async () => {
    const win = new BrowserWindow({
        width: 1220,
        height: 840,
        show: false,
        backgroundColor: '#050507',
        webPreferences: {
            preload: path.join(desktopDir, 'preload.js'),
            contextIsolation: true
        }
    });

    await win.loadFile(path.join(desktopDir, 'renderer', 'index.html'));
    await new Promise(r => setTimeout(r, 1500));

    // Capture views
    const dashImg = await captureView(win, 'dashboard', 'view-dashboard.png');
    fs.writeFileSync(path.join(assetsDir, 'agentos-studio-dashboard.png'), dashImg.toPNG());

    const partImg = await captureView(win, 'partitions', 'view-partitions.png');
    fs.writeFileSync(path.join(assetsDir, 'agentos-studio-partitions.png'), partImg.toPNG());

    await captureView(win, 'brain', 'view-brain.png');
    
    const skillsImg = await captureView(win, 'skills', 'view-skills.png');
    fs.writeFileSync(path.join(assetsDir, 'agentos-studio-skills.png'), skillsImg.toPNG());

    await captureView(win, 'skills', 'view-skillsh.png', `
        const b = document.getElementById('tab-btn-skillsh');
        if (b) b.click();
    `);

    const mcpImg = await captureView(win, 'mcp', 'view-mcp.png', `
        const scrollElem = document.querySelector('.main-content');
        if (scrollElem) scrollElem.scrollTop = 0;
    `);
    fs.writeFileSync(path.join(assetsDir, 'agentos-studio-mcp.png'), mcpImg.toPNG());

    await captureView(win, 'mcp', 'view-mcp-matrix.png', `
        const scrollElem = document.querySelector('.main-content');
        if (scrollElem) scrollElem.scrollTop = scrollElem.scrollHeight;
    `);

    const plugImg = await captureView(win, 'plugins', 'view-plugins.png');
    fs.writeFileSync(path.join(assetsDir, 'agentos-studio-plugins.png'), plugImg.toPNG());

    const storeImg = await captureView(win, 'store', 'view-store.png');
    fs.writeFileSync(path.join(assetsDir, 'agentos-studio-tool-store.png'), storeImg.toPNG());

    const runnerImg = await captureView(win, 'runner', 'view-runner.png');
    fs.writeFileSync(path.join(assetsDir, 'agentos-studio-console-runner.png'), runnerImg.toPNG());

    console.log('All screenshots successfully refreshed in assets and assets/previews!');
    app.quit();
});
