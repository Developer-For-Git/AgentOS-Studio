// AgentOS Studio - Frontend Logic

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initDashboard();
    initPartitions();
    initStore();
    initRunner();
    initSnapshots();
    initSystemHealth();
});

// Navigation Handling
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');
    const pageHeading = document.getElementById('page-heading');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-page');

            navItems.forEach(n => n.classList.remove('active'));
            pages.forEach(p => p.classList.remove('active'));

            item.classList.add('active');
            const targetPage = document.getElementById(`page-${target}`);
            if (targetPage) targetPage.classList.add('active');

            // Update title
            const titles = {
                dashboard: 'System Dashboard',
                partitions: 'Application Partitions',
                store: '1-Click Tool Store',
                runner: 'Console Runner & Sandbox',
                snapshots: 'Safety Snapshots & Rollback'
            };
            if (pageHeading && titles[target]) pageHeading.textContent = titles[target];

            // Trigger specific page refresh
            if (target === 'partitions') loadPartitions();
            if (target === 'snapshots') loadSnapshots();
            if (target === 'runner') loadRunnerDirectories();
        });
    });

    document.getElementById('btn-open-workspace').addEventListener('click', () => {
        window.api.openExplorer();
    });
}

// System Health Polling
async function initSystemHealth() {
    await refreshStatus();
    setInterval(refreshStatus, 10000);
}

async function refreshStatus() {
    try {
        const status = await window.api.getSystemStatus();
        const pill = document.getElementById('status-pill');
        const shield = document.getElementById('shield-indicator');
        const memVal = document.getElementById('dash-mem-val');

        if (status.online) {
            pill.className = 'status-pill online';
            pill.querySelector('.status-label').textContent = 'Isolated & Active';
            pill.querySelector('.status-dot').style.backgroundColor = '#10b981';

            if (status.isSecure) {
                shield.innerHTML = `<svg class="shield-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg><span>Host Drive Protected (C: Locked)</span>`;
                shield.style.display = 'flex';
            }

            if (memVal) memVal.textContent = `${status.memUsed} / ${status.memory}`;
        } else {
            pill.className = 'status-pill';
            pill.querySelector('.status-label').textContent = 'Sub-OS Offline';
            pill.querySelector('.status-dot').style.backgroundColor = '#ef4444';
        }
    } catch (err) {
        console.error('Status fetch failed', err);
    }
}

// Dashboard Page
function initDashboard() {
    document.getElementById('dash-btn-new-partition').addEventListener('click', () => {
        document.querySelector('[data-page="partitions"]').click();
        openCreateModal();
    });

    document.getElementById('dash-btn-terminal').addEventListener('click', () => {
        window.api.openTerminal();
    });

    document.getElementById('dash-btn-refresh').addEventListener('click', async () => {
        showToast('Refreshing system state...');
        await refreshStatus();
    });
}

// Partitions Page
let cachedPartitions = [];

function initPartitions() {
    loadPartitions();

    document.getElementById('btn-open-create-modal').addEventListener('click', openCreateModal);
    document.getElementById('btn-close-modal').addEventListener('click', closeCreateModal);
    document.getElementById('btn-cancel-modal').addEventListener('click', closeCreateModal);

    document.getElementById('btn-confirm-create-partition').addEventListener('click', handleCreatePartition);

    document.getElementById('partition-search').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        renderPartitions(cachedPartitions.filter(p => p.name.toLowerCase().includes(query)));
    });
}

async function loadPartitions() {
    try {
        const partitions = await window.api.getPartitions();
        cachedPartitions = partitions;
        document.getElementById('nav-partition-count').textContent = partitions.length;
        renderPartitions(partitions);
    } catch (err) {
        console.error('Failed to load partitions', err);
    }
}

function renderPartitions(partitions) {
    const container = document.getElementById('partitions-container');
    container.innerHTML = '';

    if (partitions.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 48px; color: var(--text-muted);">
                <p style="font-size: 1.1rem; font-weight: 600; margin-bottom: 8px;">No application partitions yet</p>
                <p style="font-size: 0.85rem;">Click "Create Partition" above to start your first isolated workspace.</p>
            </div>
        `;
        return;
    }

    partitions.forEach(p => {
        const card = document.createElement('div');
        card.className = 'partition-card';

        let tagsHtml = '';
        if (p.hasVenv) tagsHtml += `<span class="tag-badge python">Python venv</span>`;
        if (p.hasNode) tagsHtml += `<span class="tag-badge node">Node.js</span>`;
        if (p.hasGit) tagsHtml += `<span class="tag-badge git">Git</span>`;

        card.innerHTML = `
            <div class="partition-top">
                <span class="partition-title">${escapeHtml(p.name)}</span>
                <div class="partition-badge-group">${tagsHtml}</div>
            </div>
            <div class="partition-path">${escapeHtml(p.path)}</div>
            <div class="partition-actions">
                <button class="btn btn-secondary btn-open-exp" data-path="${escapeHtml(p.path)}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                    <span>Explorer</span>
                </button>
                <button class="btn btn-secondary btn-open-code" data-path="${escapeHtml(p.path)}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                    <span>VS Code</span>
                </button>
                <button class="btn btn-danger btn-del-part" data-name="${escapeHtml(p.name)}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        `;

        card.querySelector('.btn-open-exp').addEventListener('click', () => window.api.openExplorer(p.path));
        card.querySelector('.btn-open-code').addEventListener('click', () => window.api.openCode(p.path));
        card.querySelector('.btn-del-part').addEventListener('click', async () => {
            if (confirm(`Are you sure you want to delete partition '${p.name}'?`)) {
                showToast(`Deleting ${p.name}...`);
                await window.api.deletePartition(p.name);
                loadPartitions();
            }
        });

        container.appendChild(card);
    });
}

function openCreateModal() {
    document.getElementById('create-partition-modal').classList.add('active');
    document.getElementById('modal-partition-name').focus();
}

function closeCreateModal() {
    document.getElementById('create-partition-modal').classList.remove('active');
    document.getElementById('modal-partition-name').value = '';
}

async function handleCreatePartition() {
    const input = document.getElementById('modal-partition-name');
    const name = input.value.trim();
    if (!name) {
        showToast('Please enter a partition name');
        return;
    }

    const template = document.querySelector('input[name="modal-template"]:checked').value;
    const btn = document.getElementById('btn-confirm-create-partition');
    btn.disabled = true;
    btn.innerHTML = '<span>Creating...</span>';

    showToast(`Initializing partition '${name}' inside AgentOS...`);
    const res = await window.api.createPartition({ name, template });

    btn.disabled = false;
    btn.innerHTML = '<span>Create & Launch</span>';
    closeCreateModal();

    if (res.success) {
        showToast(`Partition '${name}' created successfully!`);
        await loadPartitions();
    } else {
        showToast(`Error: ${res.error || 'Failed to create'}`);
    }
}

// 1-Click Tool Store
function initStore() {
    const installBtns = document.querySelectorAll('.btn-store-install');
    installBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const tool = btn.getAttribute('data-tool');
            btn.disabled = true;
            btn.innerHTML = '<span>Installing...</span>';
            btn.style.background = 'var(--accent-amber)';
            btn.style.color = '#111';

            showToast(`Installing ${tool.toUpperCase()} inside isolated AgentOS...`);
            const res = await window.api.installTool(tool);

            if (res.success) {
                btn.innerHTML = '<span>Installed & Ready ✓</span>';
                btn.className = 'btn-store-install installed';
                btn.style.background = '';
                btn.style.color = '';
                showToast(`${tool.toUpperCase()} installed successfully!`);
            } else {
                btn.disabled = false;
                btn.innerHTML = '<span>Retry Install</span>';
                btn.style.background = 'var(--accent-red)';
                showToast(`Installation failed: ${res.error || 'Check console'}`);
            }
        });
    });
}

// Console Runner
function initRunner() {
    const btnRun = document.getElementById('btn-run-cmd');
    const inputCmd = document.getElementById('runner-cmd-input');
    const chkSudo = document.getElementById('runner-sudo-chk');
    const selectDir = document.getElementById('runner-dir-select');
    const terminal = document.getElementById('terminal-output');

    btnRun.addEventListener('click', runCommand);
    inputCmd.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') runCommand();
    });

    document.querySelectorAll('.preset-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            inputCmd.value = chip.getAttribute('data-cmd');
            runCommand();
        });
    });

    document.getElementById('btn-copy-terminal').addEventListener('click', () => {
        navigator.clipboard.writeText(terminal.textContent);
        showToast('Console output copied to clipboard');
    });

    async function runCommand() {
        const cmd = inputCmd.value.trim();
        if (!cmd) return;

        const workingDir = selectDir.value;
        const asRoot = chkSudo.checked;

        terminal.textContent += `\n\n$ [${workingDir}] ${asRoot ? 'sudo ' : ''}${cmd}\nRunning...`;
        terminal.scrollTop = terminal.scrollHeight;

        btnRun.disabled = true;
        btnRun.innerHTML = '<span>Running...</span>';

        const res = await window.api.runCommand({ command: cmd, workingDir, asRoot });

        btnRun.disabled = false;
        btnRun.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg><span>Execute</span>`;

        terminal.textContent = terminal.textContent.replace('Running...', '') + res.output;
        terminal.scrollTop = terminal.scrollHeight;
    }
}

async function loadRunnerDirectories() {
    try {
        const partitions = await window.api.getPartitions();
        const select = document.getElementById('runner-dir-select');
        select.innerHTML = `<option value="/workspace">/workspace (Root)</option>`;
        partitions.forEach(p => {
            select.innerHTML += `<option value="/workspace/projects/${p.name}">/workspace/projects/${p.name}</option>`;
        });
    } catch (err) {
        console.error(err);
    }
}

// Snapshots Page
function initSnapshots() {
    loadSnapshots();

    document.getElementById('btn-take-snapshot').addEventListener('click', async () => {
        const input = document.getElementById('snapshot-name-input');
        const name = input.value.trim();
        const btn = document.getElementById('btn-take-snapshot');

        btn.disabled = true;
        btn.innerHTML = '<span>Saving Snapshot...</span>';
        showToast('Exporting AgentOS to snapshot archive (this may take ~10 seconds)...');

        const res = await window.api.createSnapshot(name);

        btn.disabled = false;
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19 4h-3.5l-1-2h-5l-1 2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path></svg><span>Take Snapshot</span>`;
        input.value = '';

        if (res.success) {
            showToast('Snapshot successfully created!');
            loadSnapshots();
        } else {
            showToast('Failed to create snapshot');
        }
    });
}

async function loadSnapshots() {
    try {
        const snapshots = await window.api.getSnapshots();
        const container = document.getElementById('snapshots-container');
        container.innerHTML = '';

        if (snapshots.length === 0) {
            container.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1;">No snapshot files found in backups/.</p>`;
            return;
        }

        snapshots.forEach(s => {
            const card = document.createElement('div');
            card.className = 'snapshot-card';
            card.innerHTML = `
                <div class="snapshot-title">📦 ${escapeHtml(s.name)}</div>
                <div class="snapshot-meta">Size: ${s.sizeMB} MB  •  Created: ${new Date(s.createdAt).toLocaleDateString()}</div>
                <button class="btn btn-secondary btn-restore-snap" data-path="${escapeHtml(s.path)}" style="margin-top: 8px;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                    <span>Restore Baseline</span>
                </button>
            `;

            card.querySelector('.btn-restore-snap').addEventListener('click', async () => {
                if (confirm(`Restoring '${s.name}' will replace the OS disk. Your workspace files will NOT be deleted.\n\nProceed?`)) {
                    showToast(`Restoring ${s.name}...`);
                    await window.api.restoreSnapshot(s.path);
                    showToast('AgentOS restored successfully!');
                    refreshStatus();
                }
            });

            container.appendChild(card);
        });
    } catch (err) {
        console.error(err);
    }
}

// Utilities
function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
