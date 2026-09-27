const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // System & Sandbox
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
    restartOS: () => ipcRenderer.invoke('restart-os'),

    // Dynamic Editors Detection
    getInstalledEditors: () => ipcRenderer.invoke('get-installed-editors'),
    openEditor: (editorId, targetPath) => ipcRenderer.invoke('open-editor', { editorId, targetPath }),

    // Live Task / Todo Tracker
    getTodos: () => ipcRenderer.invoke('get-todos'),
    updateTodo: (id, updates) => ipcRenderer.invoke('update-todo', { id, updates }),

    // Skills
    getSkills: () => ipcRenderer.invoke('get-skills'),
    getSkillsShRegistry: () => ipcRenderer.invoke('get-skills-sh-registry'),
    installSkillFromRegistry: (skillId) => ipcRenderer.invoke('install-skill-from-registry', skillId),
    toggleSkill: (id, field, value) => ipcRenderer.invoke('toggle-skill', { id, field, value }),
    toggleSkillForProject: (skillId, projectName) => ipcRenderer.invoke('toggle-skill-for-project', { skillId, projectName }),
    createSkill: (skillData) => ipcRenderer.invoke('create-skill', skillData),

    // Model Context Protocol (MCP)
    getMcpServers: () => ipcRenderer.invoke('get-mcp-servers'),
    updateMcpProjectAccess: (serverId, projectName, accessLevel) => ipcRenderer.invoke('update-mcp-project-access', { serverId, projectName, accessLevel }),
    toggleMcpServerStatus: (serverId, status) => ipcRenderer.invoke('toggle-mcp-server-status', { serverId, status }),
    createMcpServer: (mcpData) => ipcRenderer.invoke('create-mcp-server', mcpData),

    // Plugins
    getPlugins: () => ipcRenderer.invoke('get-plugins'),
    togglePlugin: (pluginId) => ipcRenderer.invoke('toggle-plugin', pluginId),
    createPlugin: (pluginData) => ipcRenderer.invoke('create-plugin', pluginData),

    // Custom Tools Installation
    installCustomTool: (data) => ipcRenderer.invoke('install-custom-tool', data),

    // Project Brain (Secondary Brain / Memory / History)
    getProjectBrain: (projectName) => ipcRenderer.invoke('get-project-brain', projectName),
    addBrainMemory: (projectName, memory) => ipcRenderer.invoke('add-brain-memory', { projectName, memory }),
    deleteBrainMemory: (projectName, memoryId) => ipcRenderer.invoke('delete-brain-memory', { projectName, memoryId }),

    // Visual QA Screenshot Capture
    captureScreen: (filename) => ipcRenderer.invoke('capture-screen', filename)
});
