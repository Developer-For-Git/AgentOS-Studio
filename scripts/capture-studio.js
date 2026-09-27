const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

ipcMain.handle('get-system-status', async () => ({
    online: true,
    isSecure: true,
    memory: "16 GB",
    memUsed: "1.2 GB"
}));

ipcMain.handle('get-partitions', async () => ([]));
ipcMain.handle('get-snapshots', async () => ([]));

app.whenReady().then(async () => {
    const assetsDir = path.join(__dirname, '..', 'assets');
    if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

    const rendererDir = path.join(__dirname, '..', 'desktop', 'renderer');

    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        show: false,
        backgroundColor: '#050507',
        webPreferences: {
            preload: path.join(__dirname, '..', 'desktop', 'preload.js'),
            contextIsolation: true
        }
    });

    // 1. Dashboard
    await win.loadFile(path.join(rendererDir, 'index.html'));
    await new Promise(r => setTimeout(r, 1500));
    const img1 = await win.webContents.capturePage();
    fs.writeFileSync(path.join(assetsDir, 'agentos-studio-dashboard.png'), img1.toPNG());
    console.log('Saved: agentos-studio-dashboard.png');

    // 2. Tool Store
    await win.loadFile(path.join(rendererDir, 'store-preview.html'));
    await new Promise(r => setTimeout(r, 1500));
    const img2 = await win.webContents.capturePage();
    fs.writeFileSync(path.join(assetsDir, 'agentos-studio-tool-store.png'), img2.toPNG());
    console.log('Saved: agentos-studio-tool-store.png');

    // 3. Console Runner
    await win.loadFile(path.join(rendererDir, 'runner-preview.html'));
    await new Promise(r => setTimeout(r, 1500));
    const img3 = await win.webContents.capturePage();
    fs.writeFileSync(path.join(assetsDir, 'agentos-studio-console-runner.png'), img3.toPNG());
    console.log('Saved: agentos-studio-console-runner.png');

    app.quit();
});
