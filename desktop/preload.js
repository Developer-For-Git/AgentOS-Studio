const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    getSystemStatus: () => ipcRenderer.invoke('get-system-status'),
    getPartitions: () => ipcRenderer.invoke('get-partitions'),
    createPartition: (data) => ipcRenderer.invoke('create-partition', data),
    deletePartition: (name) => ipcRenderer.invoke('delete-partition', name),
    openExplorer: (targetPath) => ipcRenderer.invoke('open-explorer', targetPath),
    openCode: (targetPath) => ipcRenderer.invoke('open-code', targetPath),
    openTerminal: () => ipcRenderer.invoke('open-terminal'),
    runCommand: (data) => ipcRenderer.invoke('run-command', data),
    installTool: (toolKey) => ipcRenderer.invoke('install-tool', toolKey),
    getSnapshots: () => ipcRenderer.invoke('get-snapshots'),
    createSnapshot: (name) => ipcRenderer.invoke('create-snapshot', name),
    restoreSnapshot: (path) => ipcRenderer.invoke('restore-snapshot', path),
    restartOS: () => ipcRenderer.invoke('restart-os')
});
