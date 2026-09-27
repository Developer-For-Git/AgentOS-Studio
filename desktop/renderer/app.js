// AgentOS Studio - Frontend Logic

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initSystemHealth();
    initDashboard();
    initPartitions();
    initBrain();
    initSkills();
    initMcp();
    initPlugins();
    initStore();
    initRunner();
    initSnapshots();
});

// Escape HTML helper
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Toast notification helper
function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(12px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

// =========================================================
// Navigation
// =========================================================
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');
    const pageHeading = document.getElementById('page-heading');

    const titles = {
        dashboard: 'System Dashboard',
        partitions: 'Application Partitions',
        brain: 'Project Brain & Historical Memory',
        skills: 'Autonomous Agent Skills',
        mcp: 'Model Context Protocol (MCP) Hub',
        plugins: 'Runtime Extensions & Sidecars',
        store: '1-Click Tool Store',
        runner: 'Console Runner & Sandbox',
        snapshots: 'Safety Snapshots & Rollback'
    };

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-page');

            navItems.forEach(n => n.classList.remove('active'));
            pages.forEach(p => p.classList.remove('active'));

            item.classList.add('active');
            const targetPage = document.getElementById(`page-${target}`);
            if (targetPage) targetPage.classList.add('active');

            if (pageHeading && titles[target]) pageHeading.textContent = titles[target];

            // Trigger specific page refresh
            if (target === 'partitions') loadPartitions();
            if (target === 'brain') loadProjectBrain();
            if (target === 'skills') loadSkills();
            if (target === 'mcp') loadMcpServers();
            if (target === 'plugins') loadPlugins();
            if (target === 'snapshots') loadSnapshots();
            if (target === 'runner') loadRunnerDirectories();
        });
    });

    document.getElementById('btn-open-workspace').addEventListener('click', () => {
        window.api.openExplorer();
    });

    function handleHashNav() {
        if (window.location.hash) {
            const hashTarget = window.location.hash.replace('#', '');
            const targetBtn = document.querySelector(`.nav-item[data-page="${hashTarget}"]`);
            if (targetBtn) targetBtn.click();
        }
    }
    window.addEventListener('hashchange', handleHashNav);
    handleHashNav();
}

// =========================================================
// System Health Polling
// =========================================================
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


// =========================================================
// Dashboard
// =========================================================
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

// =========================================================
// Partitions & Dynamic Installed Editors Detection
// =========================================================
let cachedPartitions = [];
let cachedEditors = [];

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
        const [partitions, editors] = await Promise.all([
            window.api.getPartitions(),
            window.api.getInstalledEditors()
        ]);
        cachedPartitions = partitions;
        cachedEditors = editors || [];

        document.getElementById('nav-partition-count').textContent = partitions.length;
        renderPartitions(partitions);
        updateBrainProjectSelector(partitions);
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

        // Render detected editors buttons
        let editorButtonsHtml = '';
        cachedEditors.forEach(ed => {
            let iconSvg = '';
            let btnClass = 'btn-editor-launch';
            if (ed.id === 'antigravity-ide') {
                iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path></svg>`;
            } else if (ed.id === 'antigravity-cli') {
                iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>`;
            } else if (ed.id === 'vscode') {
                iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`;
            } else if (ed.id === 'cursor') {
                iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3l7 18 3-7 7-3L3 3z"></path></svg>`;
            } else {
                iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"></rect></svg>`;
            }

            editorButtonsHtml += `
                <button class="${btnClass}" data-editor-id="${escapeHtml(ed.id)}" data-path="${escapeHtml(p.path)}" title="Open in ${escapeHtml(ed.name)}">
                    ${iconSvg}
                    <span>${escapeHtml(ed.name)}</span>
                </button>
            `;
        });

        card.innerHTML = `
            <div class="partition-top">
                <div class="partition-title-group">
                    <span class="partition-status-indicator" title="Active Isolated Partition"></span>
                    <span class="partition-title">${escapeHtml(p.name)}</span>
                </div>
                <div class="partition-badge-group">${tagsHtml}</div>
            </div>
            
            <div class="partition-path-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                <span class="partition-path-text">${escapeHtml(p.path)}</span>
            </div>

            <div class="partition-editors-panel">
                <div class="partition-section-label">DEVELOPMENT TOOLS</div>
                <div class="partition-editors-row">
                    ${editorButtonsHtml}
                </div>
            </div>
            
            <div class="partition-actions-bar">
                <div class="partition-actions-left">
                    <button class="btn btn-action-subtle btn-open-exp" data-path="${escapeHtml(p.path)}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                        <span>Explorer</span>
                    </button>
                    <button class="btn btn-action-subtle btn-open-brain" data-name="${escapeHtml(p.name)}" title="Inspect Project Brain">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"></circle><path d="M9 10a3 3 0 0 1 6 0c0 2-3 3-3 3"></path></svg>
                        <span>Brain</span>
                    </button>
                </div>
                <button class="btn-icon-danger btn-del-part" data-name="${escapeHtml(p.name)}" title="Delete Partition">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        `;

        // Event Listeners for dynamic editor buttons
        card.querySelectorAll('.btn-editor-launch').forEach(btn => {
            btn.addEventListener('click', () => {
                const edId = btn.getAttribute('data-editor-id');
                const targetPath = btn.getAttribute('data-path');
                showToast(`Launching ${edId} for ${p.name}...`);
                window.api.openEditor(edId, targetPath);
            });
        });

        card.querySelector('.btn-open-exp').addEventListener('click', () => window.api.openExplorer(p.path));

        card.querySelector('.btn-open-brain').addEventListener('click', () => {
            document.querySelector('[data-page="brain"]').click();
            const sel = document.getElementById('brain-project-select');
            if (sel) {
                sel.value = p.name;
                loadProjectBrain();
            }
        });

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

// =========================================================
// Project Brain (Secondary Brain / Memory & History)
// =========================================================
let currentBrainProject = 'space-bunny-web';

function initBrain() {
    document.getElementById('brain-project-select').addEventListener('change', (e) => {
        currentBrainProject = e.target.value;
        loadProjectBrain();
    });

    document.getElementById('btn-refresh-brain').addEventListener('click', async () => {
        showToast('Syncing project brain memories...');
        await loadProjectBrain();
    });

    // Memory Modal
    document.getElementById('btn-add-memory').addEventListener('click', () => {
        document.getElementById('add-memory-modal').classList.add('active');
        document.getElementById('modal-memory-title').focus();
    });

    document.getElementById('btn-close-memory-modal').addEventListener('click', closeMemoryModal);
    document.getElementById('btn-cancel-memory-modal').addEventListener('click', closeMemoryModal);
    document.getElementById('btn-confirm-add-memory').addEventListener('click', handleAddMemory);

    // Tab Switching
    const tabs = document.querySelectorAll('.brain-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.brain-tab-content').forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const target = tab.getAttribute('data-tab');
            const content = document.getElementById(`brain-tab-${target}`);
            if (content) content.classList.add('active');
        });
    });
}

function updateBrainProjectSelector(partitions) {
    const sel = document.getElementById('brain-project-select');
    if (!sel) return;
    const currentVal = sel.value;
    sel.innerHTML = '';

    partitions.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.name;
        opt.textContent = p.name;
        sel.appendChild(opt);
    });

    if (currentVal && Array.from(sel.options).some(o => o.value === currentVal)) {
        sel.value = currentVal;
    } else if (sel.options.length > 0) {
        sel.value = sel.options[0].value;
    }
    currentBrainProject = sel.value;
}

async function loadProjectBrain() {
    const sel = document.getElementById('brain-project-select');
    if (!sel || !sel.value) return;
    currentBrainProject = sel.value;

    try {
        const brain = await window.api.getProjectBrain(currentBrainProject);
        renderBrain(brain);
    } catch (err) {
        console.error('Failed to load project brain', err);
    }
}

function renderBrain(brain) {
    // Stats
    const memCount = brain.memories ? brain.memories.length : 0;
    const runCount = brain.agentRuns ? brain.agentRuns.length : 0;
    const loc = brain.workStats ? brain.workStats.linesOfCode : 0;
    const runtime = (brain.techStack && brain.techStack.runtime) ? brain.techStack.runtime : 'Standard';

    document.getElementById('brain-stat-memories').textContent = memCount;
    document.getElementById('brain-stat-runs').textContent = runCount;
    document.getElementById('brain-stat-loc').textContent = loc;
    document.getElementById('brain-stat-runtime').textContent = runtime;

    // Tab 1: Memories
    const memContainer = document.getElementById('brain-memories-container');
    memContainer.innerHTML = '';
    if (!brain.memories || brain.memories.length === 0) {
        memContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 32px; color: var(--text-muted);">No persistent memories stored yet. Click "Add Memory Note" above.</div>`;
    } else {
        brain.memories.forEach(m => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.innerHTML = `
                <div class="memory-header">
                    <span class="memory-title">${escapeHtml(m.title)}</span>
                    <span class="memory-tag">${escapeHtml(m.category || 'Note')}</span>
                </div>
                <div class="memory-content">${escapeHtml(m.content)}</div>
                <div class="memory-footer">
                    <span>${m.date ? new Date(m.date).toLocaleDateString() : 'Persisted'}</span>
                    <button class="btn-del-memory" data-id="${escapeHtml(m.id)}" title="Delete Memory Note">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            `;

            card.querySelector('.btn-del-memory').addEventListener('click', async () => {
                if (confirm(`Delete memory '${m.title}'?`)) {
                    await window.api.deleteBrainMemory(currentBrainProject, m.id);
                    loadProjectBrain();
                }
            });

            memContainer.appendChild(card);
        });
    }

    // Tab 2: Agent Runs Timeline
    const runsContainer = document.getElementById('brain-runs-container');
    runsContainer.innerHTML = '';
    if (!brain.agentRuns || brain.agentRuns.length === 0) {
        runsContainer.innerHTML = `<div style="text-align: center; padding: 32px; color: var(--text-muted);">No recorded agent runs yet for this partition.</div>`;
    } else {
        brain.agentRuns.forEach(r => {
            const card = document.createElement('div');
            card.className = 'run-card';

            let filesHtml = '';
            if (r.filesTouched) {
                filesHtml = r.filesTouched.map(f => `<span class="run-file-chip">${escapeHtml(f)}</span>`).join('');
            }

            card.innerHTML = `
                <div class="run-card-header">
                    <div class="run-agent-badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="3" y="11" width="18" height="10" rx="4"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path></svg>
                        <span>${escapeHtml(r.agent)}</span>
                    </div>
                    <span class="run-time">${r.timestamp ? new Date(r.timestamp).toLocaleString() : ''}</span>
                </div>
                <div class="run-task">Task: ${escapeHtml(r.task)}</div>
                <div class="run-files">${filesHtml}</div>
                <div class="run-transcript">${escapeHtml(r.transcript)}</div>
            `;
            runsContainer.appendChild(card);
        });
    }

    // Tab 3: Tech Stack & System Directives
    const techContainer = document.getElementById('brain-tech-container');
    const ts = brain.techStack || {};
    techContainer.innerHTML = `
        <div class="tech-spec-row">
            <span class="tech-spec-label">Runtime Kernel</span>
            <span class="tech-spec-val">${escapeHtml(ts.runtime || 'Ubuntu 24.04 (WSL2)')}</span>
        </div>
        <div class="tech-spec-row">
            <span class="tech-spec-label">Frontend Architecture</span>
            <span class="tech-spec-val">${escapeHtml(ts.frontend || 'Standard Web / HTML5 / JS')}</span>
        </div>
        <div class="tech-spec-row">
            <span class="tech-spec-label">Design System Guidelines</span>
            <span class="tech-spec-val">${escapeHtml(ts.designSystem || 'Apple iOS Dark Theme')}</span>
        </div>
        <div class="tech-spec-row">
            <span class="tech-spec-label">Model Inference Gateway</span>
            <span class="tech-spec-val">${escapeHtml(ts.modelBackend || 'Internal Bridge :8000 (Universal Free Models)')}</span>
        </div>
    `;
}

function closeMemoryModal() {
    document.getElementById('add-memory-modal').classList.remove('active');
    document.getElementById('modal-memory-title').value = '';
    document.getElementById('modal-memory-content').value = '';
}

async function handleAddMemory() {
    const title = document.getElementById('modal-memory-title').value.trim();
    const category = document.getElementById('modal-memory-category').value;
    const content = document.getElementById('modal-memory-content').value.trim();

    if (!title || !content) {
        showToast('Please provide a title and memory content');
        return;
    }

    await window.api.addBrainMemory(currentBrainProject, { title, category, content });
    closeMemoryModal();
    showToast('Memory successfully saved to Project Brain!');
    loadProjectBrain();
}

// =========================================================
// Skills Management Section
// =========================================================
// =========================================================
// Skills Management Section & skills.sh Community Registry
// =========================================================
let cachedSkills = [];
let cachedSkillshRegistry = [];
let currentSkillsTab = 'installed';

function initSkills() {
    loadSkills();
    loadSkillsSh();

    // Tab switcher
    const tabInstalled = document.getElementById('tab-btn-installed');
    const tabSkillsh = document.getElementById('tab-btn-skillsh');
    const installedContainer = document.getElementById('skills-container');
    const skillshContainer = document.getElementById('skillsh-container');

    if (tabInstalled && tabSkillsh) {
        tabInstalled.addEventListener('click', () => {
            currentSkillsTab = 'installed';
            tabInstalled.classList.add('active');
            tabSkillsh.classList.remove('active');
            installedContainer.style.display = 'grid';
            skillshContainer.style.display = 'none';
        });

        tabSkillsh.addEventListener('click', () => {
            currentSkillsTab = 'skillsh';
            tabSkillsh.classList.add('active');
            tabInstalled.classList.remove('active');
            installedContainer.style.display = 'none';
            skillshContainer.style.display = 'grid';
            renderSkillsShRegistry(cachedSkillshRegistry);
        });
    }

    document.getElementById('btn-open-create-skill').addEventListener('click', () => {
        document.getElementById('create-skill-modal').classList.add('active');
        document.getElementById('modal-skill-name').focus();
    });

    document.getElementById('btn-close-skill-modal').addEventListener('click', closeSkillModal);
    document.getElementById('btn-cancel-skill-modal').addEventListener('click', closeSkillModal);
    document.getElementById('btn-confirm-create-skill').addEventListener('click', handleCreateSkill);

    document.getElementById('skill-search').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        if (currentSkillsTab === 'installed') {
            renderSkills(cachedSkills.filter(s =>
                s.name.toLowerCase().includes(query) ||
                s.category.toLowerCase().includes(query) ||
                (s.tools && s.tools.some(t => t.toLowerCase().includes(query)))
            ));
        } else {
            renderSkillsShRegistry(cachedSkillshRegistry.filter(s =>
                s.name.toLowerCase().includes(query) ||
                s.category.toLowerCase().includes(query) ||
                (s.tools && s.tools.some(t => t.toLowerCase().includes(query)))
            ));
        }
    });
}

async function loadSkills() {
    try {
        const skills = await window.api.getSkills();
        cachedSkills = skills;
        document.getElementById('nav-skills-count').textContent = skills.length;
        const badge = document.getElementById('skills-installed-badge');
        if (badge) badge.textContent = skills.length;
        renderSkills(skills);
    } catch (err) {
        console.error('Failed to load skills', err);
    }
}

async function loadSkillsSh() {
    try {
        const reg = await window.api.getSkillsShRegistry();
        cachedSkillshRegistry = reg || [];
    } catch (err) {
        console.error('Failed to load skills.sh registry', err);
    }
}

function renderSkills(skills) {
    const container = document.getElementById('skills-container');
    container.innerHTML = '';

    skills.forEach(s => {
        const card = document.createElement('div');
        card.className = 'skill-card';

        const toolsHtml = (s.tools || []).map(t => `<span class="skill-tool-tag">${escapeHtml(t)}</span>`).join('');

        // Project authorization chips
        let projectChipsHtml = '';
        cachedPartitions.forEach(p => {
            const isAssigned = (s.assignedProjects || []).includes(p.name);
            projectChipsHtml += `
                <button class="project-auth-chip ${isAssigned ? 'active' : ''}" data-skill-id="${s.id}" data-project="${p.name}">
                    ${escapeHtml(p.name)} ${isAssigned ? '✓' : '+'}
                </button>
            `;
        });

        card.innerHTML = `
            <div class="skill-header">
                <div class="skill-title-group">
                    <span class="skill-category">${escapeHtml(s.category)}</span>
                    <h3>${escapeHtml(s.name)}</h3>
                </div>
                <label class="ios-toggle">
                    <input type="checkbox" class="chk-skill-global" data-id="${s.id}" ${s.enabledGlobally ? 'checked' : ''}>
                    <span class="ios-slider"></span>
                </label>
            </div>
            <p class="skill-desc">${escapeHtml(s.description)}</p>
            <div class="skill-tools-list">${toolsHtml}</div>
            
            <div class="skill-projects-auth">
                <span class="skill-projects-auth-title">Project Authorization Matrix:</span>
                <div class="skill-project-chips">${projectChipsHtml}</div>
            </div>
        `;

        // Global toggle
        card.querySelector('.chk-skill-global').addEventListener('change', async (e) => {
            await window.api.toggleSkill(s.id, 'enabledGlobally', e.target.checked);
            showToast(`${s.name} ${e.target.checked ? 'enabled globally' : 'disabled globally'}`);
        });

        // Project chip click
        card.querySelectorAll('.project-auth-chip').forEach(chip => {
            chip.addEventListener('click', async () => {
                const sId = chip.getAttribute('data-skill-id');
                const pName = chip.getAttribute('data-project');
                await window.api.toggleSkillForProject(sId, pName);
                loadSkills();
            });
        });

        container.appendChild(card);
    });
}

function renderSkillsShRegistry(registry) {
    const container = document.getElementById('skillsh-container');
    if (!container) return;
    container.innerHTML = '';

    const installedIds = new Set(cachedSkills.map(s => s.id));

    registry.forEach(r => {
        const isInstalled = installedIds.has(r.id);
        const card = document.createElement('div');
        card.className = 'skillsh-card';

        const toolsHtml = (r.tools || []).map(t => `<span class="skill-tool-tag">${escapeHtml(t)}</span>`).join('');

        card.innerHTML = `
            <div class="skillsh-header">
                <div class="skillsh-title-group">
                    <div class="skillsh-meta-row">
                        <span class="skill-category">${escapeHtml(r.category)}</span>
                        <span>by ${escapeHtml(r.author || 'community')}</span>
                        <span class="skillsh-stars">★ ${escapeHtml(r.stars || '1.2k')}</span>
                    </div>
                    <h3>${escapeHtml(r.name)}</h3>
                </div>
            </div>
            <p class="skill-desc">${escapeHtml(r.description)}</p>
            <div class="skill-tools-list">${toolsHtml}</div>
            <button class="btn-install-skillsh ${isInstalled ? 'installed' : ''}" data-skill-id="${r.id}" ${isInstalled ? 'disabled' : ''}>
                <span>${isInstalled ? 'Installed in AgentOS ✓' : 'Install from skills.sh 1-Click'}</span>
            </button>
        `;

        const btn = card.querySelector('.btn-install-skillsh');
        if (!isInstalled && btn) {
            btn.addEventListener('click', async () => {
                btn.disabled = true;
                btn.innerHTML = '<span>Installing...</span>';
                const res = await window.api.installSkillFromRegistry(r.id);
                if (res.success) {
                    btn.classList.add('installed');
                    btn.innerHTML = '<span>Installed in AgentOS ✓</span>';
                    showToast(`Installed '${r.name}' from skills.sh!`);
                    await loadSkills();
                } else {
                    btn.disabled = false;
                    btn.innerHTML = '<span>Install from skills.sh 1-Click</span>';
                    showToast('Failed to install skill');
                }
            });
        }

        container.appendChild(card);
    });
}

function closeSkillModal() {
    document.getElementById('create-skill-modal').classList.remove('active');
    document.getElementById('modal-skill-name').value = '';
    document.getElementById('modal-skill-desc').value = '';
    document.getElementById('modal-skill-tools').value = '';
}

async function handleCreateSkill() {
    const name = document.getElementById('modal-skill-name').value.trim();
    const category = document.getElementById('modal-skill-category').value.trim() || 'Custom';
    const description = document.getElementById('modal-skill-desc').value.trim();
    const toolsStr = document.getElementById('modal-skill-tools').value.trim();
    const enabledGlobally = document.getElementById('modal-skill-global').checked;

    if (!name) {
        showToast('Please enter a skill name');
        return;
    }

    const tools = toolsStr.split(',').map(t => t.trim()).filter(Boolean);
    await window.api.createSkill({ name, category, description, tools, enabledGlobally });
    closeSkillModal();
    showToast(`Skill '${name}' created!`);
    loadSkills();
}

// =========================================================
// Model Context Protocol (MCP) Section
// =========================================================
let cachedMcpServers = [];

function initMcp() {
    loadMcpServers();

    const openBtn = document.getElementById('btn-open-create-mcp');
    if (openBtn) {
        openBtn.addEventListener('click', () => {
            document.getElementById('create-mcp-modal').classList.add('active');
            document.getElementById('modal-mcp-name').focus();
        });
    }

    const closeBtn = document.getElementById('btn-close-mcp-modal');
    if (closeBtn) closeBtn.addEventListener('click', closeMcpModal);

    const cancelBtn = document.getElementById('btn-cancel-mcp-modal');
    if (cancelBtn) cancelBtn.addEventListener('click', closeMcpModal);

    const confirmBtn = document.getElementById('btn-confirm-create-mcp');
    if (confirmBtn) confirmBtn.addEventListener('click', handleCreateMcp);
}

function closeMcpModal() {
    const modal = document.getElementById('create-mcp-modal');
    if (modal) modal.classList.remove('active');
    const nameInput = document.getElementById('modal-mcp-name');
    if (nameInput) nameInput.value = '';
    const pkgInput = document.getElementById('modal-mcp-package');
    if (pkgInput) pkgInput.value = '';
    const descInput = document.getElementById('modal-mcp-desc');
    if (descInput) descInput.value = '';
    const toolsInput = document.getElementById('modal-mcp-tools');
    if (toolsInput) toolsInput.value = '';
}

async function handleCreateMcp() {
    const name = document.getElementById('modal-mcp-name').value.trim();
    const category = document.getElementById('modal-mcp-category').value.trim() || 'Custom';
    const pkg = document.getElementById('modal-mcp-package').value.trim();
    const transport = document.getElementById('modal-mcp-transport').value;
    const description = document.getElementById('modal-mcp-desc').value.trim();
    const toolsStr = document.getElementById('modal-mcp-tools').value.trim();

    if (!name || !pkg) {
        showToast('Please provide server name and package/command');
        return;
    }

    const tools = toolsStr.split(',').map(t => t.trim()).filter(Boolean);
    await window.api.createMcpServer({ name, category, package: pkg, transport, description, tools });
    closeMcpModal();
    showToast(`MCP Server '${name}' registered!`);
    loadMcpServers();
}

async function loadMcpServers() {
    try {
        const servers = await window.api.getMcpServers();
        cachedMcpServers = servers;
        document.getElementById('nav-mcp-count').textContent = servers.length;
        document.getElementById('mcp-server-count-label').textContent = `${servers.length} Servers Configured`;
        renderMcpServers(servers);
        renderMcpMatrix(servers);
    } catch (err) {
        console.error('Failed to load MCP servers', err);
    }
}

function renderMcpServers(servers) {
    const container = document.getElementById('mcp-servers-container');
    container.innerHTML = '';

    servers.forEach(s => {
        const card = document.createElement('div');
        card.className = 'mcp-card';

        const toolsHtml = (s.tools || []).map(t => `<span class="skill-tool-tag">${escapeHtml(t)}</span>`).join('');

        card.innerHTML = `
            <div class="mcp-card-header">
                <div>
                    <span class="skill-category">${escapeHtml(s.category)}</span>
                    <h3 style="font-size: 1.05rem; font-weight: 700; color: #fff;">${escapeHtml(s.name)}</h3>
                </div>
                <span class="mcp-status-tag ${s.status}">${s.status}</span>
            </div>
            <span class="mcp-package">${escapeHtml(s.package)}</span>
            <p class="skill-desc">${escapeHtml(s.description)}</p>
            <div class="mcp-tools-section">
                <span class="mcp-tools-label">Exposed MCP Tools:</span>
                <div class="skill-tools-list">${toolsHtml}</div>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderMcpMatrix(servers) {
    const table = document.getElementById('mcp-matrix-table');
    if (!table) return;

    let headersHtml = `<tr><th>Workspace Partition</th>`;
    servers.forEach(s => {
        headersHtml += `<th>${escapeHtml(s.name)}</th>`;
    });
    headersHtml += `</tr>`;

    let rowsHtml = '';
    cachedPartitions.forEach(p => {
        rowsHtml += `<tr><td><strong style="color: #fff;">${escapeHtml(p.name)}</strong></td>`;
        servers.forEach(s => {
            const currentAccess = (s.projectAccess && s.projectAccess[p.name]) ? s.projectAccess[p.name] : 'read-write';
            rowsHtml += `
                <td>
                    <select class="matrix-select" data-server-id="${s.id}" data-project="${p.name}">
                        <option value="read-write" ${currentAccess === 'read-write' ? 'selected' : ''}>Full Access</option>
                        <option value="read-only" ${currentAccess === 'read-only' ? 'selected' : ''}>Read Only</option>
                        <option value="blocked" ${currentAccess === 'blocked' ? 'selected' : ''}>Blocked</option>
                    </select>
                </td>
            `;
        });
        rowsHtml += `</tr>`;
    });

    table.innerHTML = `<thead>${headersHtml}</thead><tbody>${rowsHtml}</tbody>`;

    table.querySelectorAll('.matrix-select').forEach(sel => {
        sel.addEventListener('change', async (e) => {
            const serverId = sel.getAttribute('data-server-id');
            const projectName = sel.getAttribute('data-project');
            const accessLevel = e.target.value;

            await window.api.updateMcpProjectAccess(serverId, projectName, accessLevel);
            showToast(`Updated ${projectName} access to ${accessLevel}`);
        });
    });
}

// =========================================================
// Plugins Section
// =========================================================
function initPlugins() {
    loadPlugins();

    const openBtn = document.getElementById('btn-open-create-plugin');
    if (openBtn) {
        openBtn.addEventListener('click', () => {
            document.getElementById('create-plugin-modal').classList.add('active');
            document.getElementById('modal-plugin-name').focus();
        });
    }

    const closeBtn = document.getElementById('btn-close-plugin-modal');
    if (closeBtn) closeBtn.addEventListener('click', closePluginModal);

    const cancelBtn = document.getElementById('btn-cancel-plugin-modal');
    if (cancelBtn) cancelBtn.addEventListener('click', closePluginModal);

    const confirmBtn = document.getElementById('btn-confirm-create-plugin');
    if (confirmBtn) confirmBtn.addEventListener('click', handleCreatePlugin);
}

function closePluginModal() {
    const modal = document.getElementById('create-plugin-modal');
    if (modal) modal.classList.remove('active');
    const nameInput = document.getElementById('modal-plugin-name');
    if (nameInput) nameInput.value = '';
    const descInput = document.getElementById('modal-plugin-desc');
    if (descInput) descInput.value = '';
}

async function handleCreatePlugin() {
    const name = document.getElementById('modal-plugin-name').value.trim();
    const category = document.getElementById('modal-plugin-category').value.trim() || 'Custom';
    const hook = document.getElementById('modal-plugin-hook').value;
    const description = document.getElementById('modal-plugin-desc').value.trim();

    if (!name) {
        showToast('Please enter a plugin name');
        return;
    }

    await window.api.createPlugin({ name, category, hook, description, icon: 'shield' });
    closePluginModal();
    showToast(`Plugin '${name}' activated!`);
    loadPlugins();
}

async function loadPlugins() {
    try {
        const plugins = await window.api.getPlugins();
        document.getElementById('nav-plugins-count').textContent = plugins.length;
        renderPlugins(plugins);
    } catch (err) {
        console.error('Failed to load plugins', err);
    }
}

function renderPlugins(plugins) {
    const container = document.getElementById('plugins-container');
    container.innerHTML = '';

    plugins.forEach(p => {
        const card = document.createElement('div');
        card.className = 'plugin-card';

        let iconSvg = '';
        if (p.icon === 'shield') {
            iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;
        } else if (p.icon === 'camera') {
            iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19 4h-3.5l-1-2h-5l-1 2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path></svg>`;
        } else if (p.icon === 'check-circle') {
            iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
        } else if (p.icon === 'activity') {
            iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`;
        } else {
            iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line></svg>`;
        }

        card.innerHTML = `
            <div class="plugin-top">
                <div class="plugin-icon-box">${iconSvg}</div>
                <label class="ios-toggle">
                    <input type="checkbox" class="chk-plugin" data-id="${p.id}" ${p.enabled ? 'checked' : ''}>
                    <span class="ios-slider"></span>
                </label>
            </div>
            <div>
                <span class="skill-category">${escapeHtml(p.category)}</span>
                <h3 class="plugin-title">${escapeHtml(p.name)}</h3>
            </div>
            <p class="plugin-desc">${escapeHtml(p.description)}</p>
        `;

        card.querySelector('.chk-plugin').addEventListener('change', async (e) => {
            await window.api.togglePlugin(p.id);
            showToast(`${p.name} ${e.target.checked ? 'activated' : 'paused'}`);
        });

        container.appendChild(card);
    });
}

// =========================================================
// 1-Click Tool Store & Custom CLI Packages
// =========================================================
function initStore() {
    const installBtns = document.querySelectorAll('.btn-store-install');
    installBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const tool = btn.getAttribute('data-tool');
            btn.disabled = true;
            btn.innerHTML = '<span>Installing...</span>';
            btn.style.background = 'rgba(255, 255, 255, 0.16)';
            btn.style.color = '#fff';

            showToast(`Installing ${tool.toUpperCase()} inside isolated AgentOS...`);
            const res = await window.api.installTool(tool);

            if (res.success) {
                btn.innerHTML = '<span>Installed & Ready ✓</span>';
                btn.className = 'btn btn-secondary';
                btn.style.background = 'rgba(48, 209, 88, 0.2)';
                btn.style.color = 'var(--accent-green)';
                showToast(`${tool.toUpperCase()} installed successfully!`);
            } else {
                btn.disabled = false;
                btn.innerHTML = '<span>Install 1-Click</span>';
                showToast(`Failed: ${res.error || 'Check console runner'}`);
            }
        });
    });

    const openCustomBtn = document.getElementById('btn-open-custom-tool');
    if (openCustomBtn) {
        openCustomBtn.addEventListener('click', () => {
            document.getElementById('install-custom-tool-modal').classList.add('active');
            document.getElementById('modal-tool-name').focus();
        });
    }

    const closeToolBtn = document.getElementById('btn-close-tool-modal');
    if (closeToolBtn) closeToolBtn.addEventListener('click', closeToolModal);

    const cancelToolBtn = document.getElementById('btn-cancel-tool-modal');
    if (cancelToolBtn) cancelToolBtn.addEventListener('click', closeToolModal);

    const confirmToolBtn = document.getElementById('btn-confirm-install-tool');
    if (confirmToolBtn) confirmToolBtn.addEventListener('click', handleInstallCustomTool);
}

function closeToolModal() {
    const modal = document.getElementById('install-custom-tool-modal');
    if (modal) modal.classList.remove('active');
    const nameInput = document.getElementById('modal-tool-name');
    if (nameInput) nameInput.value = '';
    const catInput = document.getElementById('modal-tool-category');
    if (catInput) catInput.value = '';
    const descInput = document.getElementById('modal-tool-desc');
    if (descInput) descInput.value = '';
}

async function handleInstallCustomTool() {
    const name = document.getElementById('modal-tool-name').value.trim();
    const manager = document.getElementById('modal-tool-manager').value;
    const category = document.getElementById('modal-tool-category').value.trim() || 'Custom Package';
    const desc = document.getElementById('modal-tool-desc').value.trim() || `Installed via ${manager.toUpperCase()} inside AgentOS`;

    if (!name) {
        showToast('Please enter a package name');
        return;
    }

    const confirmBtn = document.getElementById('btn-confirm-install-tool');
    confirmBtn.disabled = true;
    confirmBtn.innerText = 'Installing...';

    showToast(`Installing '${name}' via ${manager.toUpperCase()} in AgentOS...`);
    const res = await window.api.installCustomTool({ manager, packageName: name });
    confirmBtn.disabled = false;
    confirmBtn.innerText = 'Install Inside AgentOS';

    if (res.success) {
        closeToolModal();
        showToast(`'${name}' installed successfully!`);

        // Dynamically append new card to store grid
        const grid = document.getElementById('store-grid-container');
        if (grid) {
            const card = document.createElement('div');
            card.className = 'store-card';
            card.innerHTML = `
                <div class="store-card-header">
                    <div class="tool-icon" style="background: rgba(255,255,255,0.08); color: #fff;">📦</div>
                    <div>
                        <h3>${escapeHtml(name)}</h3>
                        <span class="tool-tag">${escapeHtml(category)} (${manager})</span>
                    </div>
                </div>
                <p class="store-card-desc">${escapeHtml(desc)}</p>
                <button class="btn btn-secondary" style="background: rgba(48, 209, 88, 0.2); color: var(--accent-green); cursor: default;" disabled>
                    <span>Installed & Ready ✓</span>
                </button>
            `;
            grid.prepend(card);
        }
    } else {
        showToast(`Installation failed: ${res.error || 'Check console runner'}`);
    }
}

// =========================================================
// Console Runner & Terminal
// =========================================================
function initRunner() {
    loadRunnerDirectories();

    document.getElementById('btn-run-cmd').addEventListener('click', handleRunCommand);
    document.getElementById('runner-cmd-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleRunCommand();
    });

    document.querySelectorAll('.preset-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const cmd = chip.getAttribute('data-cmd');
            document.getElementById('runner-cmd-input').value = cmd;
            handleRunCommand();
        });
    });

    document.getElementById('btn-copy-terminal').addEventListener('click', () => {
        const text = document.getElementById('terminal-output').innerText;
        navigator.clipboard.writeText(text);
        showToast('Console output copied to clipboard');
    });
}

async function loadRunnerDirectories() {
    const select = document.getElementById('runner-dir-select');
    select.innerHTML = '<option value="/workspace">/workspace (Root)</option>';

    try {
        const partitions = await window.api.getPartitions();
        partitions.forEach(p => {
            const opt = document.createElement('option');
            opt.value = `/workspace/projects/${p.name}`;
            opt.textContent = `/workspace/projects/${p.name}`;
            select.appendChild(opt);
        });
    } catch (err) {
        console.error('Failed to load dirs', err);
    }
}

async function handleRunCommand() {
    const input = document.getElementById('runner-cmd-input');
    const cmd = input.value.trim();
    if (!cmd) return;

    const workingDir = document.getElementById('runner-dir-select').value;
    const asRoot = document.getElementById('runner-sudo-chk').checked;
    const terminal = document.getElementById('terminal-output');

    terminal.innerHTML = `Running command: ${escapeHtml(cmd)}...\n`;

    const res = await window.api.runCommand({ command: cmd, workingDir, asRoot });
    terminal.innerHTML = escapeHtml(res.output || '(No output returned)');
}

// =========================================================
// Snapshots
// =========================================================
function initSnapshots() {
    loadSnapshots();

    document.getElementById('btn-take-snapshot').addEventListener('click', async () => {
        const input = document.getElementById('snapshot-name-input');
        const name = input.value.trim();
        const btn = document.getElementById('btn-take-snapshot');

        btn.disabled = true;
        btn.innerHTML = '<span>Exporting ext4.vhdx...</span>';
        showToast('Creating point-in-time microVM snapshot...');

        const res = await window.api.createSnapshot(name);

        btn.disabled = false;
        btn.innerHTML = '<span>Take Snapshot</span>';
        input.value = '';

        if (res.success) {
            showToast('Snapshot created successfully!');
            await loadSnapshots();
        } else {
            showToast('Snapshot failed');
        }
    });
}

async function loadSnapshots() {
    try {
        const snapshots = await window.api.getSnapshots();
        renderSnapshots(snapshots);
    } catch (err) {
        console.error('Failed to load snapshots', err);
    }
}

function renderSnapshots(snapshots) {
    const container = document.getElementById('snapshots-container');
    container.innerHTML = '';

    if (snapshots.length === 0) {
        container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 48px; color: var(--text-muted);"><p>No safety snapshots saved yet.</p></div>`;
        return;
    }

    snapshots.forEach(s => {
        const card = document.createElement('div');
        card.className = 'snapshot-card';
        card.innerHTML = `
            <div class="snapshot-info">
                <h4>${escapeHtml(s.name)}</h4>
                <div class="snapshot-meta">${escapeHtml(s.sizeMB)} MB • ${new Date(s.createdAt).toLocaleString()}</div>
            </div>
            <button class="btn btn-secondary btn-restore" data-path="${escapeHtml(s.path)}">
                <span>Restore Clean State</span>
            </button>
        `;

        card.querySelector('.btn-restore').addEventListener('click', async () => {
            if (confirm(`Restore AgentOS to snapshot '${s.name}'? Current changes will be reverted.`)) {
                showToast('Restoring microVM sandbox...');
                await window.api.restoreSnapshot(s.path);
                showToast('Sandbox restored to clean state!');
            }
        });

        container.appendChild(card);
    });
}
