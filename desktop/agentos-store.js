const fs = require('fs');
const path = require('path');

const aiosRoot = path.resolve(__dirname, '..');
const workspaceDir = path.join(aiosRoot, 'workspace');
const projectsDir = path.join(workspaceDir, 'projects');
const agentosDir = path.join(workspaceDir, '.agentos');

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// Ensure base directories
ensureDir(projectsDir);
ensureDir(agentosDir);

// 1. TODOS DATA
const DEFAULT_TODOS = [
    {
        id: "task-1",
        title: "Generalize Free Models in Docs & Bridge",
        category: "Documentation",
        status: "completed",
        progress: 100,
        desc: "Removed specific model references, added Cursor/Antigravity/Kilo Code."
    },
    {
        id: "task-2",
        title: "Auto-Detect Installed IDEs (Antigravity, Cursor, VS Code)",
        category: "Core / Partitions",
        status: "completed",
        progress: 100,
        desc: "Scans PC for Antigravity IDE, agy CLI, VS Code, Cursor; adds dynamic launch buttons."
    },
    {
        id: "task-3",
        title: "Model Context Protocol (MCP) Section & Authorization Matrix",
        category: "Integrations",
        status: "completed",
        progress: 100,
        desc: "Manage Filesystem, GitHub, Browser, Database, Memory MCP servers per project with fine-grained authorization."
    },
    {
        id: "task-4",
        title: "Skills Management Section & Per-Project Assignment",
        category: "Agent Framework",
        status: "completed",
        progress: 100,
        desc: "Built-in skills (Refactor, Tests, Scraper, Security Auditor) + custom skill builder with interactive project toggles."
    },
    {
        id: "task-5",
        title: "Agent Extensions & Security Plugins",
        category: "Runtime Safety",
        status: "completed",
        progress: 100,
        desc: "Secret masker, auto-snapshots on dangerous actions, linter sidecars, telemetry and preview servers."
    },
    {
        id: "task-6",
        title: "Secondary Brain / Project Brain (Memory & History)",
        category: "Memory & Telemetry",
        status: "completed",
        progress: 100,
        desc: "Persistent project brain with session chat transcripts, knowledge store, work logs, and persistent memory notes."
    },
    {
        id: "task-7",
        title: "End-to-End System Verification & UI Polish",
        category: "Verification",
        status: "completed",
        progress: 100,
        desc: "Validate seamless integration across all views, test local bridge with free models, and refine Apple iOS dark theme."
    }
];

// 2. SKILLS DATA
const DEFAULT_SKILLS = [
    {
        id: "code-refactor",
        name: "Code Modernizer & Refactor",
        category: "Refactoring",
        description: "Refactors legacy patterns, eliminates technical debt, migrates promises to async/await, and enforces clean modular code.",
        tools: ["ast-grep", "prettier", "git-diff"],
        enabledGlobally: true,
        assignedProjects: ["my-first-app", "space-bunny-web"]
    },
    {
        id: "test-architect",
        name: "Automated Test Suite Architect",
        category: "Testing",
        description: "Analyzes codebase logic and automatically authors comprehensive unit, integration, and edge-case test suites (PyTest, Vitest, Jest).",
        tools: ["pytest", "jest", "coverage-cli"],
        enabledGlobally: true,
        assignedProjects: ["space-bunny-web"]
    },
    {
        id: "web-scraper",
        name: "Web Scraper & DOM Navigator",
        category: "Automation",
        description: "Automates headless Chromium browsing via Playwright, extracts structured markdown, downloads docs, and bypasses bot walls.",
        tools: ["playwright", "puppeteer", "cheerio"],
        enabledGlobally: false,
        assignedProjects: ["space-bunny-web"]
    },
    {
        id: "security-auditor",
        name: "Security & Secret Vulnerability Auditor",
        category: "Security",
        description: "Deep-scans partitions for leaked secrets, OWASP vulnerabilities, SQL injection risks, and outdated CVE-impacted dependencies.",
        tools: ["semgrep", "trufflehog", "npm-audit", "pip-audit"],
        enabledGlobally: true,
        assignedProjects: ["my-first-app", "space-bunny-web"]
    },
    {
        id: "git-workflow",
        name: "Git Flow & Auto-Committer",
        category: "Version Control",
        description: "Inspects uncommitted diffs, generates semantic Conventional Commits, drafts GitHub pull requests, and resolves merge conflicts.",
        tools: ["git", "gh-cli"],
        enabledGlobally: true,
        assignedProjects: ["space-bunny-web"]
    },
    {
        id: "api-builder",
        name: "OpenAPI & REST Schema Builder",
        category: "Architecture",
        description: "Auto-generates OpenAPI 3.1 specifications, TypeScript client SDKs, and mock server handlers directly from backend route definitions.",
        tools: ["swagger-cli", "prism", "ts-morph"],
        enabledGlobally: false,
        assignedProjects: ["my-first-app"]
    },
    {
        id: "doc-synthesizer",
        name: "Documentation & Markdown Synthesizer",
        category: "Documentation",
        description: "Synthesizes comprehensive markdown documentation, architecture diagrams, and API references directly from codebase AST.",
        tools: ["typedoc", "jsdoc", "markdown-it"],
        enabledGlobally: true,
        assignedProjects: ["space-bunny-web"]
    },
    {
        id: "database-migrator",
        name: "SQL Schema & Migration Planner",
        category: "Database",
        description: "Designs relational schemas, generates safe schema migrations (Prisma, Alembic, Drizzle), and optimizes slow SQL queries.",
        tools: ["prisma", "alembic", "sqllint"],
        enabledGlobally: false,
        assignedProjects: ["my-first-app"]
    },
    {
        id: "docker-containerizer",
        name: "Production Docker & Compose Generator",
        category: "DevOps",
        description: "Generates multi-stage optimized Dockerfiles, docker-compose configurations, and health checks tailored to project runtime.",
        tools: ["docker", "hadolint"],
        enabledGlobally: true,
        assignedProjects: ["my-first-app", "space-bunny-web"]
    },
    {
        id: "performance-profiler",
        name: "Runtime Performance & Memory Profiler",
        category: "Optimization",
        description: "Identifies memory leaks, unoptimized loops, blocking I/O calls, and bundle bloat across Python and JavaScript codebases.",
        tools: ["clinicjs", "py-spy", "webpack-bundle-analyzer"],
        enabledGlobally: false,
        assignedProjects: ["space-bunny-web"]
    }
];

// skills.sh Community Registry Catalog
const SKILLS_SH_REGISTRY = [
    {
        id: "skillsh-browser-tester",
        name: "Playwright E2E Visual Regression Tester",
        author: "@skills-sh/testing",
        downloads: "42.8k",
        category: "Testing",
        description: "Runs visual regression comparisons, takes diff screenshots, and simulates complex user flows across web applications.",
        tools: ["playwright", "pixelmatch", "axe-core"]
    },
    {
        id: "skillsh-i18n-localizer",
        name: "Multi-Language i18n Localizer",
        author: "@skills-sh/intl",
        downloads: "18.3k",
        category: "Localization",
        description: "Extracts hardcoded UI strings into JSON localization dictionaries and auto-translates into 25+ target languages.",
        tools: ["i18next", "formatjs", "gettext"]
    },
    {
        id: "skillsh-graphql-nexus",
        name: "GraphQL Schema & Resolver Generator",
        author: "@skills-sh/api",
        downloads: "31.2k",
        category: "Architecture",
        description: "Constructs strongly-typed GraphQL schemas, Apollo Server resolvers, and DataLoader batching queries.",
        tools: ["graphql-codegen", "apollo-server"]
    },
    {
        id: "skillsh-tailwind-styler",
        name: "Tailwind CSS & Design Token Engine",
        author: "@skills-sh/design",
        downloads: "64.1k",
        category: "Design",
        description: "Generates responsive, accessible Tailwind components, manages color tokens, and purges unused utility classes.",
        tools: ["tailwindcss", "postcss", "clsx"]
    },
    {
        id: "skillsh-k8s-manifest",
        name: "Kubernetes Manifest & Helm Chart Builder",
        author: "@skills-sh/cloud",
        downloads: "24.5k",
        category: "DevOps",
        description: "Generates production Kubernetes manifests, Deployments, Services, Ingress, and parameterized Helm charts.",
        tools: ["kubectl", "helm", "kubeval"]
    }
];

// 3. MCP DATA
const DEFAULT_MCP = [
    {
        id: "mcp-filesystem",
        name: "Filesystem MCP",
        package: "@modelcontextprotocol/server-filesystem",
        category: "Core Storage",
        status: "online",
        description: "Strictly sandboxed filesystem operations within /workspace. Prevents host drive escape.",
        tools: ["read_file", "write_file", "list_directory", "move_file", "get_file_info"],
        projectAccess: {
            "my-first-app": "read-write",
            "space-bunny-web": "read-write"
        }
    },
    {
        id: "mcp-github",
        name: "GitHub MCP",
        package: "@modelcontextprotocol/server-github",
        category: "Version Control",
        status: "online",
        description: "Interact with GitHub repositories, pull requests, issues, and code search.",
        tools: ["search_repositories", "create_issue", "get_file_contents", "create_pull_request", "push_files"],
        projectAccess: {
            "my-first-app": "read-only",
            "space-bunny-web": "read-write"
        }
    },
    {
        id: "mcp-browser",
        name: "Puppeteer / Browser MCP",
        package: "puppeteer-mcp",
        category: "Web Automation",
        status: "standby",
        description: "Headless browser automation inside AgentOS sandbox. Navigates pages and takes screenshots.",
        tools: ["navigate_url", "click_element", "fill_input", "take_screenshot", "extract_text"],
        projectAccess: {
            "my-first-app": "blocked",
            "space-bunny-web": "read-write"
        }
    },
    {
        id: "mcp-database",
        name: "SQLite & Postgres MCP",
        package: "@modelcontextprotocol/server-sqlite",
        category: "Database",
        status: "standby",
        description: "Executes read/write SQL queries and schema introspection on sandbox databases.",
        tools: ["query_db", "list_tables", "describe_table", "execute_migration"],
        projectAccess: {
            "my-first-app": "read-write",
            "space-bunny-web": "blocked"
        }
    },
    {
        id: "mcp-memory",
        name: "Knowledge Graph Memory MCP",
        package: "@modelcontextprotocol/server-memory",
        category: "Memory & Context",
        status: "online",
        description: "Graph-based memory server enabling agents to recall project architecture and decisions across sessions.",
        tools: ["create_entities", "add_observations", "read_graph", "search_nodes"],
        projectAccess: {
            "my-first-app": "read-write",
            "space-bunny-web": "read-write"
        }
    },
    {
        id: "mcp-fetch",
        name: "Fetch & Doc Reader MCP",
        package: "@modelcontextprotocol/server-fetch",
        category: "Web Retrieval",
        status: "online",
        description: "Converts web pages, RFCs, and API documentation into clean markdown for agents.",
        tools: ["fetch_markdown", "inspect_headers", "search_documentation"],
        projectAccess: {
            "my-first-app": "read-only",
            "space-bunny-web": "read-write"
        }
    },
    {
        id: "mcp-brave-search",
        name: "Brave Web Search MCP",
        package: "@modelcontextprotocol/server-brave-search",
        category: "Search & Web",
        status: "online",
        description: "Gives AI agents fast, privacy-focused web search queries for real-time documentation and debugging.",
        tools: ["brave_web_search", "brave_local_search"],
        projectAccess: {
            "my-first-app": "read-write",
            "space-bunny-web": "read-write"
        }
    },
    {
        id: "mcp-terminal",
        name: "Terminal & Shell Execution MCP",
        package: "@modelcontextprotocol/server-terminal",
        category: "System Execution",
        status: "online",
        description: "Sandboxed command runner allowing agents to execute bash commands, run test runners, and inspect processes.",
        tools: ["execute_bash", "check_process", "kill_process", "get_env"],
        projectAccess: {
            "my-first-app": "read-write",
            "space-bunny-web": "read-write"
        }
    },
    {
        id: "mcp-git",
        name: "Git Tools MCP",
        package: "@modelcontextprotocol/server-git",
        category: "Version Control",
        status: "online",
        description: "Direct Git operations including diff inspection, branching, commit history, and staging.",
        tools: ["git_status", "git_diff", "git_commit", "git_checkout", "git_log"],
        projectAccess: {
            "my-first-app": "read-write",
            "space-bunny-web": "read-write"
        }
    }
];

// 4. PLUGINS DATA
const DEFAULT_PLUGINS = [
    {
        id: "plugin-secret-masker",
        name: "Secret Masker & Sanitizer",
        category: "Security",
        description: "Detects and redacts API keys (OpenAI, Anthropic, AWS, Stripe), passwords, and tokens from all console logs and agent outputs.",
        enabled: true,
        icon: "shield"
    },
    {
        id: "plugin-auto-snapshot",
        name: "Auto-Snapshot Safety Trigger",
        category: "Safety",
        description: "Automatically captures a point-in-time microVM rollback snapshot before an agent executes high-impact shell commands or mass refactors.",
        enabled: true,
        icon: "camera"
    },
    {
        id: "plugin-linter-sidecar",
        name: "Linter & Formatter Sidecar",
        category: "Code Quality",
        description: "Runs background linting (Ruff for Python, ESLint & Prettier for Node) each time an agent completes file edits.",
        enabled: true,
        icon: "check-circle"
    },
    {
        id: "plugin-token-telemetry",
        name: "Token & Inference Telemetry",
        category: "Observability",
        description: "Monitors input/output tokens, inference latency, and streaming speeds across free models and custom endpoints.",
        enabled: true,
        icon: "activity"
    },
    {
        id: "plugin-dev-preview",
        name: "Hot-Reload Dev Server Preview",
        category: "Developer Experience",
        description: "Discovers active local web servers (ports 3000, 5000, 8000) and displays embedded live previews directly in the studio.",
        enabled: true,
        icon: "globe"
    },
    {
        id: "plugin-git-checkpoint",
        name: "Auto-Git Checkpoint",
        category: "Version Safety",
        description: "Automatically creates shadow git stashes and clean workspace commits before any autonomous agent run begins.",
        enabled: true,
        icon: "git-commit"
    },
    {
        id: "plugin-egress-filter",
        name: "Network Egress Firewall",
        category: "Security",
        description: "Restricts outbound agent HTTP requests strictly to whitelisted package registries and model endpoints.",
        enabled: false,
        icon: "lock"
    },
    {
        id: "plugin-resource-limiter",
        name: "Memory & CPU Resource Limiter",
        category: "Reliability",
        description: "Caps memory usage per partition microVM to 4GB and throttles runaway loops to prevent host freeze.",
        enabled: true,
        icon: "cpu"
    }
];

// Helpers to read/write JSON files
function readJson(filePath, defaultValue) {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error(`Error reading ${filePath}:`, e);
    }
    writeJson(filePath, defaultValue);
    return defaultValue;
}

function writeJson(filePath, data) {
    try {
        const dir = path.dirname(filePath);
        ensureDir(dir);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (e) {
        console.error(`Error writing ${filePath}:`, e);
        return false;
    }
}

// File paths
const todosFile = path.join(agentosDir, 'todos.json');
const skillsFile = path.join(agentosDir, 'skills.json');
const mcpFile = path.join(agentosDir, 'mcp.json');
const pluginsFile = path.join(agentosDir, 'plugins.json');

// --- Todos Operations ---
function getTodos() {
    return readJson(todosFile, DEFAULT_TODOS);
}

function updateTodo(id, updates) {
    const todos = getTodos();
    const idx = todos.findIndex(t => t.id === id);
    if (idx !== -1) {
        todos[idx] = { ...todos[idx], ...updates };
        writeJson(todosFile, todos);
        return { success: true, todo: todos[idx] };
    }
    return { success: false, error: 'Todo not found' };
}

// --- Skills Operations ---
function getSkills() {
    return readJson(skillsFile, DEFAULT_SKILLS);
}

function toggleSkill(id, field, value) {
    const skills = getSkills();
    const idx = skills.findIndex(s => s.id === id);
    if (idx !== -1) {
        skills[idx][field] = value;
        writeJson(skillsFile, skills);
        return { success: true, skill: skills[idx] };
    }
    return { success: false, error: 'Skill not found' };
}

function toggleSkillForProject(skillId, projectName) {
    const skills = getSkills();
    const skill = skills.find(s => s.id === skillId);
    if (skill) {
        if (!skill.assignedProjects) skill.assignedProjects = [];
        const pIdx = skill.assignedProjects.indexOf(projectName);
        if (pIdx !== -1) {
            skill.assignedProjects.splice(pIdx, 1);
        } else {
            skill.assignedProjects.push(projectName);
        }
        writeJson(skillsFile, skills);
        return { success: true, skill };
    }
    return { success: false, error: 'Skill not found' };
}

function createSkill(skillData) {
    const skills = getSkills();
    const newSkill = {
        id: 'skill-' + Date.now(),
        name: skillData.name,
        category: skillData.category || 'Custom',
        description: skillData.description || '',
        tools: skillData.tools || [],
        enabledGlobally: !!skillData.enabledGlobally,
        assignedProjects: skillData.assignedProjects || []
    };
    skills.push(newSkill);
    writeJson(skillsFile, skills);
    return { success: true, skill: newSkill };
}

function getSkillsShRegistry() {
    return SKILLS_SH_REGISTRY;
}

function installSkillFromRegistry(skillId) {
    const regSkill = SKILLS_SH_REGISTRY.find(s => s.id === skillId);
    if (!regSkill) return { success: false, error: 'Skill not found in skills.sh registry' };
    const skills = getSkills();
    if (skills.some(s => s.id === regSkill.id)) {
        return { success: true, message: 'Skill already installed', skill: regSkill };
    }
    const newSkill = {
        id: regSkill.id,
        name: regSkill.name,
        category: regSkill.category,
        description: regSkill.description,
        tools: regSkill.tools,
        enabledGlobally: true,
        assignedProjects: ["my-first-app", "space-bunny-web"]
    };
    skills.push(newSkill);
    writeJson(skillsFile, skills);
    return { success: true, skill: newSkill };
}

// --- MCP Operations ---
function getMcpServers() {
    return readJson(mcpFile, DEFAULT_MCP);
}

function updateMcpProjectAccess(serverId, projectName, accessLevel) {
    const servers = getMcpServers();
    const s = servers.find(item => item.id === serverId);
    if (s) {
        if (!s.projectAccess) s.projectAccess = {};
        s.projectAccess[projectName] = accessLevel;
        writeJson(mcpFile, servers);
        return { success: true, server: s };
    }
    return { success: false, error: 'MCP Server not found' };
}

function toggleMcpServerStatus(serverId, newStatus) {
    const servers = getMcpServers();
    const s = servers.find(item => item.id === serverId);
    if (s) {
        s.status = newStatus;
        writeJson(mcpFile, servers);
        return { success: true, server: s };
    }
    return { success: false, error: 'MCP Server not found' };
}

function createMcpServer(mcpData) {
    const servers = getMcpServers();
    const toolsArr = Array.isArray(mcpData.tools) 
        ? mcpData.tools 
        : (mcpData.tools || '').split(',').map(t => t.trim()).filter(Boolean);
        
    const newServer = {
        id: 'mcp-' + Date.now(),
        name: mcpData.name,
        package: mcpData.package || ('custom/' + mcpData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')),
        category: mcpData.category || 'Custom MCP',
        status: 'online',
        description: mcpData.description || 'Custom Model Context Protocol integration.',
        tools: toolsArr.length ? toolsArr : ['query', 'execute', 'inspect'],
        projectAccess: {
            "my-first-app": "read-write",
            "space-bunny-web": "read-write"
        }
    };
    servers.push(newServer);
    writeJson(mcpFile, servers);
    return { success: true, server: newServer };
}

// --- Plugins Operations ---
function getPlugins() {
    return readJson(pluginsFile, DEFAULT_PLUGINS);
}

function togglePlugin(pluginId) {
    const plugins = getPlugins();
    const p = plugins.find(item => item.id === pluginId);
    if (p) {
        p.enabled = !p.enabled;
        writeJson(pluginsFile, plugins);
        return { success: true, plugin: p };
    }
    return { success: false, error: 'Plugin not found' };
}

function createPlugin(pluginData) {
    const plugins = getPlugins();
    const newPlugin = {
        id: 'plugin-' + Date.now(),
        name: pluginData.name,
        category: pluginData.category || 'Custom Extension',
        description: pluginData.description || 'Custom runtime sidecar.',
        hook: pluginData.hook || 'Pre-Tool-Execution',
        enabled: true,
        icon: pluginData.icon || 'terminal'
    };
    plugins.push(newPlugin);
    writeJson(pluginsFile, plugins);
    return { success: true, plugin: newPlugin };
}

// --- Project Brain Operations ---
function getProjectBrain(projectName) {
    const safeName = projectName.replace(/[^a-zA-Z0-9_-]/g, '');
    const brainDir = path.join(projectsDir, safeName, '.agentos');
    ensureDir(brainDir);
    const brainFile = path.join(brainDir, 'brain.json');

    // Default template if new
    const defaultBrain = {
        projectName: safeName,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        summary: `Dedicated project brain for ${safeName}. Stores persistent architectural decisions, session history, and agent memories.`,
        techStack: {
            runtime: "Auto-detected",
            frontend: "N/A",
            designSystem: "Apple iOS Dark Mode",
            modelBackend: "Internal Bridge (http://127.0.0.1:8000)"
        },
        memories: [
            {
                id: 'mem-' + Date.now(),
                title: 'Project Initialized',
                content: `Partition ${safeName} created inside AgentOS Ubuntu sandbox. All host drives unmounted.`,
                category: 'Setup',
                date: new Date().toISOString()
            }
        ],
        agentRuns: [
            {
                id: 'run-' + Date.now(),
                agent: 'Antigravity CLI (agy)',
                timestamp: new Date().toISOString(),
                task: `Workspace partition configured for ${safeName}`,
                outcome: 'Success',
                filesTouched: ['/workspace/projects/' + safeName],
                transcript: 'Sub-OS allocated virtual ext4 partition. Ready for agent execution.'
            }
        ],
        workStats: {
            totalSessions: 1,
            linesOfCode: 0,
            filesCreated: 0,
            testsPassed: "Pending"
        }
    };

    // If it's space-bunny-web, seed with rich real data
    if (safeName === 'space-bunny-web' && !fs.existsSync(brainFile)) {
        defaultBrain.summary = "Modern Apple iOS-inspired dark showcase web application with interactive widgets, particle canvas, and live model bridge telemetry.";
        defaultBrain.techStack = {
            runtime: "Python 3.12 (HTTP Server on port 5000)",
            frontend: "HTML5, CSS3 Glassmorphism, Vanilla JS ES6",
            designSystem: "Apple iOS Dark Mode (Dark oval ambient depth, crisp Apple White buttons)",
            modelBackend: "Multi-protocol bridge on http://127.0.0.1:8000"
        };
        defaultBrain.memories = [
            {
                id: 'mem-101',
                title: 'Design System Guideline',
                content: 'Strictly adhere to Apple iOS / macOS Sequoia dark theme. Avoid neon AI slop, purple gradients, and noisy badges. Use deep dark oval background gradients, crisp Apple White pill buttons, and refined frosted glass for secondary actions.',
                category: 'Design',
                date: '2026-09-26T21:15:00.000Z'
            },
            {
                id: 'mem-102',
                title: 'Model Bridge Protocol',
                content: 'The internal bridge daemon runs at http://127.0.0.1:8000. It translates Anthropic /v1/messages SSE and OpenAI /v1/chat/completions into unlimited free reasoning models.',
                category: 'Architecture',
                date: '2026-09-26T21:40:00.000Z'
            },
            {
                id: 'mem-103',
                title: 'Port Allocation',
                content: 'Port 5000 is reserved for space-bunny-web HTTP preview server. Port 8000 is reserved for the model bridge daemon.',
                category: 'Infrastructure',
                date: '2026-09-26T22:00:00.000Z'
            }
        ];
        defaultBrain.agentRuns = [
            {
                id: 'run-101',
                agent: 'Claude Code (v2.1.283)',
                timestamp: '2026-09-26T21:45:00.000Z',
                task: 'Create initial web prototype with responsive dark layout',
                outcome: 'Success',
                filesTouched: ['index.html', 'styles.css', 'app.js'],
                transcript: 'Agent analyzed requirements -> scaffolded index.html -> applied dark CSS styles -> verified on port 5000.'
            },
            {
                id: 'run-102',
                agent: 'Antigravity CLI (agy)',
                timestamp: '2026-09-26T22:20:00.000Z',
                task: 'Refactor UI to Apple iOS dark theme with oval depth and white pill buttons',
                outcome: 'Success',
                filesTouched: ['styles.css', 'index.html'],
                transcript: 'Agent replaced standard cards with frosted liquid glass (backdrop blur 40px), centered action buttons, added dark oval ambient lighting.'
            },
            {
                id: 'run-103',
                agent: 'Aider (v0.86.2)',
                timestamp: '2026-09-26T22:50:00.000Z',
                task: 'Add interactive feature cards and live health telemetry ping to bridge',
                outcome: 'Success',
                filesTouched: ['app.js'],
                transcript: 'Agent integrated async ping to http://127.0.0.1:8000/v1/models and added interactive animations.'
            }
        ];
        defaultBrain.workStats = {
            totalSessions: 3,
            linesOfCode: 984,
            filesCreated: 3,
            testsPassed: "All verified"
        };
    }

    return readJson(brainFile, defaultBrain);
}

function addBrainMemory(projectName, memory) {
    const safeName = projectName.replace(/[^a-zA-Z0-9_-]/g, '');
    const brainDir = path.join(projectsDir, safeName, '.agentos');
    ensureDir(brainDir);
    const brainFile = path.join(brainDir, 'brain.json');
    const brain = getProjectBrain(safeName);

    const newMem = {
        id: 'mem-' + Date.now(),
        title: memory.title || 'Untitled Memory',
        content: memory.content || '',
        category: memory.category || 'General',
        date: new Date().toISOString()
    };

    brain.memories.unshift(newMem);
    brain.lastUpdated = new Date().toISOString();
    writeJson(brainFile, brain);
    return { success: true, memory: newMem, brain };
}

function deleteBrainMemory(projectName, memoryId) {
    const safeName = projectName.replace(/[^a-zA-Z0-9_-]/g, '');
    const brainDir = path.join(projectsDir, safeName, '.agentos');
    const brainFile = path.join(brainDir, 'brain.json');
    const brain = getProjectBrain(safeName);

    brain.memories = brain.memories.filter(m => m.id !== memoryId);
    brain.lastUpdated = new Date().toISOString();
    writeJson(brainFile, brain);
    return { success: true, brain };
}

module.exports = {
    getTodos,
    updateTodo,
    getSkills,
    toggleSkill,
    toggleSkillForProject,
    createSkill,
    getSkillsShRegistry,
    installSkillFromRegistry,
    getMcpServers,
    updateMcpProjectAccess,
    toggleMcpServerStatus,
    createMcpServer,
    getPlugins,
    togglePlugin,
    createPlugin,
    getProjectBrain,
    addBrainMemory,
    deleteBrainMemory
};
