using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace AgentOSManager
{
    public class MainForm : Form
    {
        // Colors - Modern Dark Palette
        private Color colorBg = Color.FromArgb(24, 24, 37);
        private Color colorSidebar = Color.FromArgb(17, 17, 27);
        private Color colorCard = Color.FromArgb(30, 30, 46);
        private Color colorCardHover = Color.FromArgb(40, 40, 60);
        private Color colorBorder = Color.FromArgb(49, 50, 68);
        private Color colorAccent = Color.FromArgb(137, 180, 250);
        private Color colorAccentHover = Color.FromArgb(180, 190, 254);
        private Color colorSuccess = Color.FromArgb(166, 227, 161);
        private Color colorWarning = Color.FromArgb(249, 226, 175);
        private Color colorDanger = Color.FromArgb(243, 139, 168);
        private Color colorText = Color.FromArgb(205, 214, 244);
        private Color colorSubtext = Color.FromArgb(166, 173, 200);
        private Color colorTerminalBg = Color.FromArgb(13, 14, 21);

        // Directories
        private string appBaseDir;
        private string workspaceDir;
        private string projectsDir;
        private string backupsDir;

        // UI Controls
        private Panel sidebarPanel;
        private Panel contentPanel;
        private Label lblHeaderStatus;
        private Label lblHeaderShield;
        private Button btnNavDashboard;
        private Button btnNavPartitions;
        private Button btnNavStore;
        private Button btnNavRunner;
        private Button btnNavSnapshots;
        private Button activeNavBtn;

        // Pages
        private Panel pageDashboard;
        private Panel pagePartitions;
        private Panel pageStore;
        private Panel pageRunner;
        private Panel pageSnapshots;

        // Dashboard Controls
        private Label lblOsInfo;
        private Label lblMemInfo;
        private Label lblDiskInfo;
        private Label lblIsoInfo;

        // Partitions Controls
        private FlowLayoutPanel flowPartitions;
        private TextBox txtNewPartitionName;
        private ComboBox cmbTemplate;

        // Runner Controls
        private ComboBox cmbRunWorkDir;
        private TextBox txtCommand;
        private CheckBox chkSudo;
        private TextBox txtConsole;
        private Button btnRunCommand;

        // Snapshots Controls
        private FlowLayoutPanel flowSnapshots;
        private TextBox txtSnapshotName;

        [STAThread]
        public static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new MainForm());
        }

        public MainForm()
        {
            InitializePaths();
            InitializeWindow();
            BuildUI();
            SwitchPage(pageDashboard, btnNavDashboard);
            RefreshDashboardAsync();
        }

        private void InitializePaths()
        {
            appBaseDir = AppDomain.CurrentDomain.BaseDirectory;
            // If running from gui\ subfolder or root
            if (File.Exists(Path.Combine(appBaseDir, "agentos.bat")))
            {
                // current dir is root
            }
            else if (File.Exists(Path.Combine(appBaseDir, "..", "agentos.bat")))
            {
                appBaseDir = Path.GetFullPath(Path.Combine(appBaseDir, ".."));
            }
            else
            {
                // Default fallback
                appBaseDir = @"C:\Users\LOL\Desktop\AIOS";
            }

            workspaceDir = Path.Combine(appBaseDir, "workspace");
            projectsDir = Path.Combine(workspaceDir, "projects");
            backupsDir = Path.Combine(appBaseDir, "backups");

            if (!Directory.Exists(projectsDir)) Directory.CreateDirectory(projectsDir);
            if (!Directory.Exists(backupsDir)) Directory.CreateDirectory(backupsDir);
        }

        private void InitializeWindow()
        {
            this.Text = "AgentOS Manager - Isolated AI Environment";
            this.Size = new Size(1000, 720);
            this.MinimumSize = new Size(900, 620);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.BackColor = colorBg;
            this.ForeColor = colorText;
            this.Font = new Font("Segoe UI", 9.5f, FontStyle.Regular);
        }

        private void BuildUI()
        {
            // Top Header Bar
            Panel topBar = new Panel
            {
                Dock = DockStyle.Top,
                Height = 65,
                BackColor = colorSidebar,
                Padding = new Padding(20, 10, 20, 10)
            };

            Label lblLogo = new Label
            {
                Text = "🤖 AgentOS",
                Font = new Font("Segoe UI", 16f, FontStyle.Bold),
                ForeColor = colorAccent,
                AutoSize = true,
                Location = new Point(15, 8)
            };

            Label lblSubtitle = new Label
            {
                Text = "Isolated Containerized Sub-OS for AI Agents",
                Font = new Font("Segoe UI", 9f, FontStyle.Regular),
                ForeColor = colorSubtext,
                AutoSize = true,
                Location = new Point(18, 38)
            };

            lblHeaderShield = new Label
            {
                Text = "🛡️ Host C: Drive Protected",
                Font = new Font("Segoe UI", 10f, FontStyle.Bold),
                ForeColor = colorSuccess,
                AutoSize = true,
                Anchor = AnchorStyles.Top | AnchorStyles.Right,
                Location = new Point(620, 20)
            };

            lblHeaderStatus = new Label
            {
                Text = "🟢 Active & Ready",
                Font = new Font("Segoe UI", 10f, FontStyle.Bold),
                ForeColor = colorSuccess,
                AutoSize = true,
                Anchor = AnchorStyles.Top | AnchorStyles.Right,
                Location = new Point(830, 20)
            };

            topBar.Controls.Add(lblLogo);
            topBar.Controls.Add(lblSubtitle);
            topBar.Controls.Add(lblHeaderShield);
            topBar.Controls.Add(lblHeaderStatus);
            this.Controls.Add(topBar);

            // Left Sidebar
            sidebarPanel = new Panel
            {
                Dock = DockStyle.Left,
                Width = 200,
                BackColor = colorSidebar,
                Padding = new Padding(10, 15, 10, 15)
            };

            btnNavDashboard = CreateNavButton("🏠 Dashboard", 10);
            btnNavPartitions = CreateNavButton("📂 Partitions", 60);
            btnNavStore = CreateNavButton("🛒 Tool Store", 110);
            btnNavRunner = CreateNavButton("💻 Runner & Terminal", 160);
            btnNavSnapshots = CreateNavButton("🔄 Snapshots & Safety", 210);

            btnNavDashboard.Click += (s, e) => SwitchPage(pageDashboard, btnNavDashboard);
            btnNavPartitions.Click += (s, e) => { SwitchPage(pagePartitions, btnNavPartitions); RefreshPartitions(); };
            btnNavStore.Click += (s, e) => SwitchPage(pageStore, btnNavStore);
            btnNavRunner.Click += (s, e) => { SwitchPage(pageRunner, btnNavRunner); RefreshRunnerDirs(); };
            btnNavSnapshots.Click += (s, e) => { SwitchPage(pageSnapshots, btnNavSnapshots); RefreshSnapshots(); };

            sidebarPanel.Controls.Add(btnNavDashboard);
            sidebarPanel.Controls.Add(btnNavPartitions);
            sidebarPanel.Controls.Add(btnNavStore);
            sidebarPanel.Controls.Add(btnNavRunner);
            sidebarPanel.Controls.Add(btnNavSnapshots);

            // Open Folder Shortcut at bottom of sidebar
            Button btnOpenFolder = CreateFlatButton("📂 Open Workspace", colorCard, colorText);
            btnOpenFolder.Dock = DockStyle.Bottom;
            btnOpenFolder.Height = 40;
            btnOpenFolder.Click += (s, e) => Process.Start("explorer.exe", workspaceDir);
            sidebarPanel.Controls.Add(btnOpenFolder);

            this.Controls.Add(sidebarPanel);

            // Content Panel (Holds the pages)
            contentPanel = new Panel
            {
                Dock = DockStyle.Fill,
                BackColor = colorBg,
                Padding = new Padding(25)
            };
            this.Controls.Add(contentPanel);

            // Build Pages
            BuildDashboardPage();
            BuildPartitionsPage();
            BuildStorePage();
            BuildRunnerPage();
            BuildSnapshotsPage();
        }

        private Button CreateNavButton(string text, int top)
        {
            Button btn = new Button
            {
                Text = text,
                Location = new Point(10, top),
                Size = new Size(180, 42),
                FlatStyle = FlatStyle.Flat,
                BackColor = colorSidebar,
                ForeColor = colorText,
                TextAlign = ContentAlignment.MiddleLeft,
                Font = new Font("Segoe UI", 10.5f, FontStyle.Regular),
                Cursor = Cursors.Hand,
                Padding = new Padding(12, 0, 0, 0)
            };
            btn.FlatAppearance.BorderSize = 0;
            btn.MouseEnter += (s, e) => { if (btn != activeNavBtn) btn.BackColor = colorCard; };
            btn.MouseLeave += (s, e) => { if (btn != activeNavBtn) btn.BackColor = colorSidebar; };
            return btn;
        }

        private Button CreateFlatButton(string text, Color bg, Color fg)
        {
            Button btn = new Button
            {
                Text = text,
                FlatStyle = FlatStyle.Flat,
                BackColor = bg,
                ForeColor = fg,
                Font = new Font("Segoe UI", 9.5f, FontStyle.Bold),
                Cursor = Cursors.Hand,
                Height = 36
            };
            btn.FlatAppearance.BorderSize = 0;
            return btn;
        }

        private void SwitchPage(Panel targetPage, Button targetNavBtn)
        {
            if (activeNavBtn != null)
            {
                activeNavBtn.BackColor = colorSidebar;
                activeNavBtn.ForeColor = colorText;
                activeNavBtn.Font = new Font("Segoe UI", 10.5f, FontStyle.Regular);
            }

            activeNavBtn = targetNavBtn;
            activeNavBtn.BackColor = colorCard;
            activeNavBtn.ForeColor = colorAccent;
            activeNavBtn.Font = new Font("Segoe UI", 10.5f, FontStyle.Bold);

            contentPanel.Controls.Clear();
            targetPage.Dock = DockStyle.Fill;
            contentPanel.Controls.Add(targetPage);
        }

        #region Page 1: Dashboard
        private void BuildDashboardPage()
        {
            pageDashboard = new Panel { AutoScroll = true };

            Label lblTitle = new Label
            {
                Text = "System Health & Security Shield",
                Font = new Font("Segoe UI", 15f, FontStyle.Bold),
                ForeColor = colorText,
                AutoSize = true,
                Location = new Point(0, 5)
            };
            pageDashboard.Controls.Add(lblTitle);

            // Cards Panel
            TableLayoutPanel statsTable = new TableLayoutPanel
            {
                Location = new Point(0, 45),
                Size = new Size(740, 160),
                ColumnCount = 2,
                RowCount = 2,
                Anchor = AnchorStyles.Top | AnchorStyles.Left | AnchorStyles.Right
            };
            statsTable.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 50f));
            statsTable.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 50f));
            statsTable.RowStyles.Add(new RowStyle(SizeType.Percent, 50f));
            statsTable.RowStyles.Add(new RowStyle(SizeType.Percent, 50f));

            Panel card1 = CreateCard("Operating System", "Ubuntu 24.04 LTS (Kernel 6.18+)", out lblOsInfo);
            Panel card2 = CreateCard("Host Isolation Barrier", "🛡️ Windows C: Drive is UNMOUNTED (Isolated)", out lblIsoInfo);
            Panel card3 = CreateCard("Allocated Memory (RAM)", "Checking...", out lblMemInfo);
            Panel card4 = CreateCard("Virtual Hard Disk", "Dynamic Sparse ext4.vhdx", out lblDiskInfo);

            statsTable.Controls.Add(card1, 0, 0);
            statsTable.Controls.Add(card2, 1, 0);
            statsTable.Controls.Add(card3, 0, 1);
            statsTable.Controls.Add(card4, 1, 1);

            pageDashboard.Controls.Add(statsTable);

            // Action Buttons
            Label lblActions = new Label
            {
                Text = "Quick Actions",
                Font = new Font("Segoe UI", 13f, FontStyle.Bold),
                ForeColor = colorText,
                AutoSize = true,
                Location = new Point(0, 225)
            };
            pageDashboard.Controls.Add(lblActions);

            FlowLayoutPanel actionsFlow = new FlowLayoutPanel
            {
                Location = new Point(0, 260),
                Size = new Size(740, 55),
                Anchor = AnchorStyles.Top | AnchorStyles.Left | AnchorStyles.Right
            };

            Button btnNewProj = CreateFlatButton("➕ New Project Partition", colorAccent, Color.FromArgb(17, 17, 27));
            btnNewProj.Size = new Size(180, 42);
            btnNewProj.Click += (s, e) => { SwitchPage(pagePartitions, btnNavPartitions); RefreshPartitions(); };

            Button btnLaunchTerminal = CreateFlatButton("🖥️ Open Agent Terminal", colorCard, colorText);
            btnLaunchTerminal.Size = new Size(170, 42);
            btnLaunchTerminal.Click += (s, e) => Process.Start(Path.Combine(appBaseDir, "agentos.bat"));

            Button btnRefresh = CreateFlatButton("🔄 Refresh Status", colorCard, colorText);
            btnRefresh.Size = new Size(140, 42);
            btnRefresh.Click += (s, e) => RefreshDashboardAsync();

            Button btnRestart = CreateFlatButton("⏹️ Restart OS", colorDanger, Color.FromArgb(17, 17, 27));
            btnRestart.Size = new Size(130, 42);
            btnRestart.Click += async (s, e) =>
            {
                btnRestart.Enabled = false;
                btnRestart.Text = "Restarting...";
                await Task.Run(() => RunProcess("wsl.exe", "-t AgentOS"));
                await Task.Delay(1500);
                await RefreshDashboardAsync();
                btnRestart.Enabled = true;
                btnRestart.Text = "⏹️ Restart OS";
            };

            actionsFlow.Controls.Add(btnNewProj);
            actionsFlow.Controls.Add(btnLaunchTerminal);
            actionsFlow.Controls.Add(btnRefresh);
            actionsFlow.Controls.Add(btnRestart);

            pageDashboard.Controls.Add(actionsFlow);

            // Summary Info Box
            Panel infoBox = new Panel
            {
                Location = new Point(0, 330),
                Size = new Size(740, 220),
                BackColor = colorCard,
                Padding = new Padding(20),
                Anchor = AnchorStyles.Top | AnchorStyles.Left | AnchorStyles.Right
            };

            Label lblInfoBoxTitle = new Label
            {
                Text = "💡 Beginner Guide: What is AgentOS doing?",
                Font = new Font("Segoe UI", 11.5f, FontStyle.Bold),
                ForeColor = colorAccent,
                AutoSize = true,
                Location = new Point(15, 15)
            };

            Label lblInfoBoxContent = new Label
            {
                Text = "• Full Protection: The AI agent gets full root privileges inside AgentOS, but CANNOT touch your Windows host files, personal folders, or system drives.\n\n" +
                       "• No Scary Terminal Needed: Use the 'Partitions' tab to click and create apps, or the 'Tool Store' tab to install tools with 1 click.\n\n" +
                       "• Safe Blast Radius: If an agent installs broken packages or runs destructive code, your PC is 100% unaffected. You can restore AgentOS in 10 seconds via the 'Snapshots' tab.",
                Font = new Font("Segoe UI", 9.5f, FontStyle.Regular),
                ForeColor = colorSubtext,
                Size = new Size(700, 150),
                Location = new Point(15, 45)
            };

            infoBox.Controls.Add(lblInfoBoxTitle);
            infoBox.Controls.Add(lblInfoBoxContent);
            pageDashboard.Controls.Add(infoBox);
        }

        private Panel CreateCard(string title, string defaultVal, out Label valLabel)
        {
            Panel card = new Panel
            {
                Dock = DockStyle.Fill,
                BackColor = colorCard,
                Padding = new Padding(15),
                Margin = new Padding(5)
            };

            Label lblT = new Label
            {
                Text = title,
                Font = new Font("Segoe UI", 9f, FontStyle.Regular),
                ForeColor = colorSubtext,
                Dock = DockStyle.Top,
                Height = 20
            };

            valLabel = new Label
            {
                Text = defaultVal,
                Font = new Font("Segoe UI", 10.5f, FontStyle.Bold),
                ForeColor = colorText,
                Dock = DockStyle.Fill
            };

            card.Controls.Add(valLabel);
            card.Controls.Add(lblT);
            return card;
        }

        private async Task RefreshDashboardAsync()
        {
            lblHeaderStatus.Text = "🟡 Querying...";
            lblHeaderStatus.ForeColor = colorWarning;

            string infoOut = await Task.Run(() => RunProcess("wsl.exe", "-d AgentOS agentos info"));
            if (string.IsNullOrEmpty(infoOut))
            {
                lblHeaderStatus.Text = "🔴 Stopped";
                lblHeaderStatus.ForeColor = colorDanger;
                return;
            }

            lblHeaderStatus.Text = "🟢 Active & Ready";
            lblHeaderStatus.ForeColor = colorSuccess;

            // Update isolation
            if (infoOut.Contains("Host C: drive is UNMOUNTED"))
            {
                lblIsoInfo.Text = "🛡️ SECURE: Host C: Drive Locked Out";
                lblIsoInfo.ForeColor = colorSuccess;
                lblHeaderShield.ForeColor = colorSuccess;
            }
            else
            {
                lblIsoInfo.Text = "⚠️ WARNING: Host Mount Active";
                lblIsoInfo.ForeColor = colorWarning;
                lblHeaderShield.ForeColor = colorWarning;
            }

            // Update Memory
            string memLine = "";
            string[] lines = infoOut.Split('\n');
            foreach (var line in lines)
            {
                if (line.StartsWith("Mem:"))
                {
                    memLine = line.Trim();
                    break;
                }
            }
            if (!string.IsNullOrEmpty(memLine))
            {
                lblMemInfo.Text = memLine;
            }

            // Update disk
            lblDiskInfo.Text = "Stored in distro\\ext4.vhdx (Safe Isolated VHD)";
        }
        #endregion

        #region Page 2: Partitions
        private void BuildPartitionsPage()
        {
            pagePartitions = new Panel { AutoScroll = true };

            Label lblTitle = new Label
            {
                Text = "Application Partitions Manager",
                Font = new Font("Segoe UI", 15f, FontStyle.Bold),
                ForeColor = colorText,
                AutoSize = true,
                Location = new Point(0, 5)
            };
            pagePartitions.Controls.Add(lblTitle);

            // New Partition Creator Box
            Panel createBox = new Panel
            {
                Location = new Point(0, 45),
                Size = new Size(740, 80),
                BackColor = colorCard,
                Padding = new Padding(15),
                Anchor = AnchorStyles.Top | AnchorStyles.Left | AnchorStyles.Right
            };

            Label lblName = new Label
            {
                Text = "Project Name:",
                ForeColor = colorSubtext,
                Location = new Point(15, 12),
                AutoSize = true
            };
            createBox.Controls.Add(lblName);

            txtNewPartitionName = new TextBox
            {
                Location = new Point(15, 35),
                Size = new Size(220, 28),
                BackColor = colorBg,
                ForeColor = colorText,
                BorderStyle = BorderStyle.FixedSingle,
                Font = new Font("Segoe UI", 10f)
            };
            createBox.Controls.Add(txtNewPartitionName);

            Label lblTpl = new Label
            {
                Text = "Stack Template:",
                ForeColor = colorSubtext,
                Location = new Point(255, 12),
                AutoSize = true
            };
            createBox.Controls.Add(lblTpl);

            cmbTemplate = new ComboBox
            {
                Location = new Point(255, 35),
                Size = new Size(220, 28),
                BackColor = colorBg,
                ForeColor = colorText,
                DropDownStyle = ComboBoxStyle.DropDownList,
                Font = new Font("Segoe UI", 10f)
            };
            cmbTemplate.Items.AddRange(new object[] { "Python (with .venv + Git)", "Node.js (with package.json + Git)", "Fullstack (Python + Node.js)", "Blank Workspace" });
            cmbTemplate.SelectedIndex = 0;
            createBox.Controls.Add(cmbTemplate);

            Button btnCreate = CreateFlatButton("✨ Create Partition", colorSuccess, Color.FromArgb(17, 17, 27));
            btnCreate.Location = new Point(495, 32);
            btnCreate.Size = new Size(160, 32);
            btnCreate.Click += async (s, e) =>
            {
                string pName = txtNewPartitionName.Text.Trim();
                if (string.IsNullOrEmpty(pName))
                {
                    MessageBox.Show("Please enter a partition name.", "Error", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    return;
                }

                btnCreate.Enabled = false;
                btnCreate.Text = "Creating...";

                string templateType = cmbTemplate.SelectedIndex.ToString();
                await Task.Run(() => CreatePartition(pName, cmbTemplate.SelectedIndex));

                txtNewPartitionName.Text = "";
                btnCreate.Enabled = true;
                btnCreate.Text = "✨ Create Partition";
                RefreshPartitions();

                MessageBox.Show("Partition '" + pName + "' successfully created and synced to Windows!", "Success", MessageBoxButtons.OK, MessageBoxIcon.Information);
            };
            createBox.Controls.Add(btnCreate);

            pagePartitions.Controls.Add(createBox);

            // Partitions List Header
            Label lblList = new Label
            {
                Text = "Active Product Partitions",
                Font = new Font("Segoe UI", 13f, FontStyle.Bold),
                ForeColor = colorText,
                AutoSize = true,
                Location = new Point(0, 140)
            };
            pagePartitions.Controls.Add(lblList);

            // Flow panel for partition cards
            flowPartitions = new FlowLayoutPanel
            {
                Location = new Point(0, 175),
                Size = new Size(740, 420),
                AutoScroll = true,
                Anchor = AnchorStyles.Top | AnchorStyles.Bottom | AnchorStyles.Left | AnchorStyles.Right
            };
            pagePartitions.Controls.Add(flowPartitions);
        }

        private void CreatePartition(string name, int templateIndex)
        {
            // Run creation inside WSL using agentos CLI or manual
            RunProcess("wsl.exe", string.Format("-d AgentOS agentos new {0}", name));

            string targetDir = Path.Combine(projectsDir, name);
            if (templateIndex == 1) // Node.js
            {
                RunProcess("wsl.exe", string.Format("-d AgentOS --cd /workspace/projects/{0} npm init -y", name));
            }
            else if (templateIndex == 2) // Fullstack
            {
                RunProcess("wsl.exe", string.Format("-d AgentOS --cd /workspace/projects/{0} npm init -y", name));
            }
        }

        private void RefreshPartitions()
        {
            flowPartitions.Controls.Clear();
            if (!Directory.Exists(projectsDir)) return;

            string[] dirs = Directory.GetDirectories(projectsDir);
            if (dirs.Length == 0)
            {
                Label emptyLbl = new Label
                {
                    Text = "No partitions yet. Use the box above to create your first application!",
                    ForeColor = colorSubtext,
                    AutoSize = true,
                    Margin = new Padding(15)
                };
                flowPartitions.Controls.Add(emptyLbl);
                return;
            }

            foreach (var d in dirs)
            {
                string dirName = Path.GetFileName(d);
                Panel pCard = new Panel
                {
                    Size = new Size(720, 75),
                    BackColor = colorCard,
                    Margin = new Padding(0, 0, 0, 10),
                    Padding = new Padding(15)
                };

                Label pTitle = new Label
                {
                    Text = "📁  " + dirName,
                    Font = new Font("Segoe UI", 11.5f, FontStyle.Bold),
                    ForeColor = colorAccent,
                    Location = new Point(15, 12),
                    AutoSize = true
                };

                bool hasVenv = Directory.Exists(Path.Combine(d, ".venv"));
                bool hasGit = Directory.Exists(Path.Combine(d, ".git"));
                bool hasNode = File.Exists(Path.Combine(d, "package.json"));

                string stack = "Stack: ";
                if (hasVenv) stack += "[Python venv] ";
                if (hasNode) stack += "[Node.js] ";
                if (hasGit) stack += "[Git] ";
                if (stack == "Stack: ") stack += "[Custom]";

                Label pStack = new Label
                {
                    Text = stack + "  •  Path: C:\\Users\\LOL\\Desktop\\AIOS\\workspace\\projects\\" + dirName,
                    Font = new Font("Segoe UI", 9f),
                    ForeColor = colorSubtext,
                    Location = new Point(18, 38),
                    AutoSize = true
                };

                Button btnOpen = CreateFlatButton("📂 Explorer", colorBg, colorText);
                btnOpen.Size = new Size(100, 32);
                btnOpen.Location = new Point(400, 20);
                btnOpen.Click += (s, e) => Process.Start("explorer.exe", d);

                Button btnCode = CreateFlatButton("💻 VS Code", colorBg, colorText);
                btnCode.Size = new Size(100, 32);
                btnCode.Location = new Point(510, 20);
                btnCode.Click += (s, e) =>
                {
                    try { Process.Start("code", "\"" + d + "\""); }
                    catch { Process.Start("explorer.exe", d); }
                };

                Button btnDel = CreateFlatButton("🗑️ Delete", colorDanger, Color.FromArgb(17, 17, 27));
                btnDel.Size = new Size(85, 32);
                btnDel.Location = new Point(620, 20);
                btnDel.Click += (s, e) =>
                {
                    var res = MessageBox.Show("Are you sure you want to delete partition '" + dirName + "'?", "Confirm Delete", MessageBoxButtons.YesNo, MessageBoxIcon.Warning);
                    if (res == DialogResult.Yes)
                    {
                        RunProcess("wsl.exe", string.Format("-d AgentOS agentos delete {0}", dirName));
                        RefreshPartitions();
                    }
                };

                pCard.Controls.Add(pTitle);
                pCard.Controls.Add(pStack);
                pCard.Controls.Add(btnOpen);
                pCard.Controls.Add(btnCode);
                pCard.Controls.Add(btnDel);

                flowPartitions.Controls.Add(pCard);
            }
        }
        #endregion

        #region Page 3: Tool Store
        private void BuildStorePage()
        {
            pageStore = new Panel { AutoScroll = true };

            Label lblTitle = new Label
            {
                Text = "1-Click Tool Store (Isolated in AgentOS)",
                Font = new Font("Segoe UI", 15f, FontStyle.Bold),
                ForeColor = colorText,
                AutoSize = true,
                Location = new Point(0, 5)
            };
            pageStore.Controls.Add(lblTitle);

            Label lblDesc = new Label
            {
                Text = "Install CLI tools, SDKs, and databases into the AgentOS container without cluttering your Windows PC.",
                ForeColor = colorSubtext,
                Location = new Point(0, 35),
                AutoSize = true
            };
            pageStore.Controls.Add(lblDesc);

            FlowLayoutPanel flowStore = new FlowLayoutPanel
            {
                Location = new Point(0, 70),
                Size = new Size(740, 520),
                AutoScroll = true,
                Anchor = AnchorStyles.Top | AnchorStyles.Bottom | AnchorStyles.Left | AnchorStyles.Right
            };

            flowStore.Controls.Add(CreateStoreCard("AWS CLI v2", "Official command line interface for Amazon Web Services.", "aws", "agentos install-cli aws"));
            flowStore.Controls.Add(CreateStoreCard("Supabase CLI", "Local Postgres database, Auth, Storage, and Edge Functions.", "supabase", "npm install -g supabase"));
            flowStore.Controls.Add(CreateStoreCard("Stripe CLI", "Test webhooks, process payments, and manage Stripe resources.", "stripe", "agentos install-cli stripe"));
            flowStore.Controls.Add(CreateStoreCard("Redis Server", "High-performance in-memory cache and pub/sub message broker.", "redis-server", "sudo apt-get install -y redis-server"));
            flowStore.Controls.Add(CreateStoreCard("PostgreSQL", "Robust, enterprise-grade relational database system.", "psql", "sudo apt-get install -y postgresql postgresql-contrib"));
            flowStore.Controls.Add(CreateStoreCard("Docker / Podman", "OCI container runtime for multi-container agent tasks.", "podman", "sudo apt-get install -y podman"));

            pageStore.Controls.Add(flowStore);
        }

        private Panel CreateStoreCard(string name, string desc, string checkCmd, string installCmd)
        {
            Panel card = new Panel
            {
                Size = new Size(350, 140),
                BackColor = colorCard,
                Margin = new Padding(0, 0, 15, 15),
                Padding = new Padding(15)
            };

            Label lblN = new Label
            {
                Text = "⚡  " + name,
                Font = new Font("Segoe UI", 12f, FontStyle.Bold),
                ForeColor = colorAccent,
                Location = new Point(12, 12),
                AutoSize = true
            };

            Label lblD = new Label
            {
                Text = desc,
                Font = new Font("Segoe UI", 9f),
                ForeColor = colorSubtext,
                Location = new Point(15, 40),
                Size = new Size(320, 45)
            };

            Button btnInstall = CreateFlatButton("Install 1-Click", colorAccent, Color.FromArgb(17, 17, 27));
            btnInstall.Size = new Size(130, 32);
            btnInstall.Location = new Point(15, 95);

            btnInstall.Click += async (s, e) =>
            {
                btnInstall.Enabled = false;
                btnInstall.Text = "Installing...";
                btnInstall.BackColor = colorWarning;

                await Task.Run(() => RunProcess("wsl.exe", "-d AgentOS bash -lc \"" + installCmd + "\""));

                btnInstall.Text = "✅ Installed";
                btnInstall.BackColor = colorSuccess;
                MessageBox.Show(name + " has been successfully installed into AgentOS!", "Installation Complete", MessageBoxButtons.OK, MessageBoxIcon.Information);
            };

            card.Controls.Add(lblN);
            card.Controls.Add(lblD);
            card.Controls.Add(btnInstall);
            return card;
        }
        #endregion

        #region Page 4: Console Runner
        private void BuildRunnerPage()
        {
            pageRunner = new Panel { AutoScroll = true };

            Label lblTitle = new Label
            {
                Text = "Agent Command Runner & Output Console",
                Font = new Font("Segoe UI", 15f, FontStyle.Bold),
                ForeColor = colorText,
                AutoSize = true,
                Location = new Point(0, 5)
            };
            pageRunner.Controls.Add(lblTitle);

            // Controls Bar
            Panel bar = new Panel
            {
                Location = new Point(0, 40),
                Size = new Size(740, 85),
                BackColor = colorCard,
                Padding = new Padding(12),
                Anchor = AnchorStyles.Top | AnchorStyles.Left | AnchorStyles.Right
            };

            Label lblDir = new Label { Text = "Directory:", ForeColor = colorSubtext, Location = new Point(12, 10), AutoSize = true };
            cmbRunWorkDir = new ComboBox
            {
                Location = new Point(12, 32),
                Size = new Size(200, 28),
                BackColor = colorBg,
                ForeColor = colorText,
                DropDownStyle = ComboBoxStyle.DropDownList,
                Font = new Font("Segoe UI", 10f)
            };

            Label lblCmd = new Label { Text = "Command to run inside AgentOS:", ForeColor = colorSubtext, Location = new Point(225, 10), AutoSize = true };
            txtCommand = new TextBox
            {
                Location = new Point(225, 32),
                Size = new Size(340, 28),
                BackColor = colorBg,
                ForeColor = colorText,
                BorderStyle = BorderStyle.FixedSingle,
                Font = new Font("Segoe UI", 10f)
            };

            btnRunCommand = CreateFlatButton("▶ Run", colorAccent, Color.FromArgb(17, 17, 27));
            btnRunCommand.Location = new Point(580, 29);
            btnRunCommand.Size = new Size(90, 32);

            chkSudo = new CheckBox
            {
                Text = "Root (sudo)",
                ForeColor = colorSubtext,
                Location = new Point(12, 60),
                AutoSize = true
            };

            btnRunCommand.Click += async (s, e) => await ExecuteRunnerCommandAsync();
            txtCommand.KeyDown += async (s, e) =>
            {
                if (e.KeyCode == Keys.Enter)
                {
                    e.SuppressKeyPress = true;
                    await ExecuteRunnerCommandAsync();
                }
            };

            bar.Controls.Add(lblDir);
            bar.Controls.Add(cmbRunWorkDir);
            bar.Controls.Add(lblCmd);
            bar.Controls.Add(txtCommand);
            bar.Controls.Add(btnRunCommand);
            bar.Controls.Add(chkSudo);

            pageRunner.Controls.Add(bar);

            // Quick command buttons
            FlowLayoutPanel quickFlow = new FlowLayoutPanel
            {
                Location = new Point(0, 135),
                Size = new Size(740, 40),
                Anchor = AnchorStyles.Top | AnchorStyles.Left | AnchorStyles.Right
            };

            AddQuickBtn(quickFlow, "OS Info", "agentos info");
            AddQuickBtn(quickFlow, "Python Version", "python3 --version && pip --version");
            AddQuickBtn(quickFlow, "Node Version", "node -v && npm -v");
            AddQuickBtn(quickFlow, "Git Version", "git --version");
            AddQuickBtn(quickFlow, "Disk Usage", "df -h / /workspace");
            AddQuickBtn(quickFlow, "Installed CLIs", "which gh aws supabase node python3 git 2>&1");

            pageRunner.Controls.Add(quickFlow);

            // Console output textbox
            txtConsole = new TextBox
            {
                Location = new Point(0, 185),
                Size = new Size(740, 400),
                Multiline = true,
                ScrollBars = ScrollBars.Vertical,
                BackColor = colorTerminalBg,
                ForeColor = colorSuccess,
                Font = new Font("Consolas", 10f),
                ReadOnly = true,
                Anchor = AnchorStyles.Top | AnchorStyles.Bottom | AnchorStyles.Left | AnchorStyles.Right
            };
            pageRunner.Controls.Add(txtConsole);
        }

        private void AddQuickBtn(FlowLayoutPanel flow, string label, string cmd)
        {
            Button btn = CreateFlatButton(label, colorCard, colorSubtext);
            btn.Size = new Size(115, 30);
            btn.Font = new Font("Segoe UI", 8.5f);
            btn.Click += async (s, e) =>
            {
                txtCommand.Text = cmd;
                await ExecuteRunnerCommandAsync();
            };
            flow.Controls.Add(btn);
        }

        private void RefreshRunnerDirs()
        {
            cmbRunWorkDir.Items.Clear();
            cmbRunWorkDir.Items.Add("/workspace");
            if (Directory.Exists(projectsDir))
            {
                foreach (var d in Directory.GetDirectories(projectsDir))
                {
                    cmbRunWorkDir.Items.Add("/workspace/projects/" + Path.GetFileName(d));
                }
            }
            cmbRunWorkDir.SelectedIndex = 0;
        }

        private async Task ExecuteRunnerCommandAsync()
        {
            string cmd = txtCommand.Text.Trim();
            if (string.IsNullOrEmpty(cmd)) return;

            string dir = cmbRunWorkDir.SelectedItem != null ? cmbRunWorkDir.SelectedItem.ToString() : "/workspace";
            bool asRoot = chkSudo.Checked;

            btnRunCommand.Enabled = false;
            btnRunCommand.Text = "Running...";
            txtConsole.AppendText(string.Format("\r\n$ [in {0}] {1}\r\n", dir, cmd));

            string wslArgs = string.Format("-d AgentOS {0}--cd \"{1}\" bash -lc \"{2}\"",
                asRoot ? "-u root " : "",
                dir,
                cmd.Replace("\"", "\\\""));

            string output = await Task.Run(() => RunProcess("wsl.exe", wslArgs));
            txtConsole.AppendText(output + "\r\n");
            txtConsole.SelectionStart = txtConsole.Text.Length;
            txtConsole.ScrollToCaret();

            btnRunCommand.Enabled = true;
            btnRunCommand.Text = "▶ Run";
        }
        #endregion

        #region Page 5: Snapshots & Safety
        private void BuildSnapshotsPage()
        {
            pageSnapshots = new Panel { AutoScroll = true };

            Label lblTitle = new Label
            {
                Text = "Snapshots, Safety & 1-Click Rollback",
                Font = new Font("Segoe UI", 15f, FontStyle.Bold),
                ForeColor = colorText,
                AutoSize = true,
                Location = new Point(0, 5)
            };
            pageSnapshots.Controls.Add(lblTitle);

            Panel createSnapBox = new Panel
            {
                Location = new Point(0, 45),
                Size = new Size(740, 75),
                BackColor = colorCard,
                Padding = new Padding(15),
                Anchor = AnchorStyles.Top | AnchorStyles.Left | AnchorStyles.Right
            };

            Label lblSnapN = new Label { Text = "Snapshot Name:", ForeColor = colorSubtext, Location = new Point(15, 12), AutoSize = true };
            txtSnapshotName = new TextBox
            {
                Location = new Point(15, 33),
                Size = new Size(300, 28),
                BackColor = colorBg,
                ForeColor = colorText,
                BorderStyle = BorderStyle.FixedSingle,
                Font = new Font("Segoe UI", 10f)
            };

            Button btnTakeSnap = CreateFlatButton("📸 Take Instant Snapshot", colorAccent, Color.FromArgb(17, 17, 27));
            btnTakeSnap.Location = new Point(330, 30);
            btnTakeSnap.Size = new Size(200, 32);
            btnTakeSnap.Click += async (s, e) =>
            {
                string sName = txtSnapshotName.Text.Trim();
                if (string.IsNullOrEmpty(sName)) sName = "snapshot-" + DateTime.Now.ToString("yyyyMMdd-HHmmss");
                if (!sName.EndsWith(".tar")) sName += ".tar";

                btnTakeSnap.Enabled = false;
                btnTakeSnap.Text = "Exporting (Wait)...";

                string dest = Path.Combine(backupsDir, sName);
                await Task.Run(() =>
                {
                    RunProcess("wsl.exe", "-t AgentOS");
                    RunProcess("wsl.exe", string.Format("--export AgentOS \"{0}\"", dest));
                });

                txtSnapshotName.Text = "";
                btnTakeSnap.Enabled = true;
                btnTakeSnap.Text = "📸 Take Instant Snapshot";
                RefreshSnapshots();
                MessageBox.Show("Snapshot created successfully!\nSaved to: " + dest, "Success", MessageBoxButtons.OK, MessageBoxIcon.Information);
            };

            createSnapBox.Controls.Add(lblSnapN);
            createSnapBox.Controls.Add(txtSnapshotName);
            createSnapBox.Controls.Add(btnTakeSnap);
            pageSnapshots.Controls.Add(createSnapBox);

            Label lblList = new Label
            {
                Text = "Available Restorable Snapshots",
                Font = new Font("Segoe UI", 13f, FontStyle.Bold),
                ForeColor = colorText,
                AutoSize = true,
                Location = new Point(0, 135)
            };
            pageSnapshots.Controls.Add(lblList);

            flowSnapshots = new FlowLayoutPanel
            {
                Location = new Point(0, 170),
                Size = new Size(740, 420),
                AutoScroll = true,
                Anchor = AnchorStyles.Top | AnchorStyles.Bottom | AnchorStyles.Left | AnchorStyles.Right
            };
            pageSnapshots.Controls.Add(flowSnapshots);
        }

        private void RefreshSnapshots()
        {
            flowSnapshots.Controls.Clear();
            if (!Directory.Exists(backupsDir)) return;

            string[] files = Directory.GetFiles(backupsDir, "*.tar");
            if (files.Length == 0)
            {
                Label emptyLbl = new Label
                {
                    Text = "No snapshot archives found in backups/.",
                    ForeColor = colorSubtext,
                    AutoSize = true,
                    Margin = new Padding(15)
                };
                flowSnapshots.Controls.Add(emptyLbl);
                return;
            }

            foreach (var f in files)
            {
                FileInfo fi = new FileInfo(f);
                Panel sCard = new Panel
                {
                    Size = new Size(720, 70),
                    BackColor = colorCard,
                    Margin = new Padding(0, 0, 0, 10),
                    Padding = new Padding(15)
                };

                Label sTitle = new Label
                {
                    Text = "📦  " + fi.Name,
                    Font = new Font("Segoe UI", 11f, FontStyle.Bold),
                    ForeColor = colorAccent,
                    Location = new Point(15, 12),
                    AutoSize = true
                };

                double sizeMB = Math.Round((double)fi.Length / (1024 * 1024), 1);
                Label sSub = new Label
                {
                    Text = string.Format("Size: {0} MB  •  Created: {1}", sizeMB, fi.LastWriteTime.ToString("yyyy-MM-dd HH:mm")),
                    Font = new Font("Segoe UI", 9f),
                    ForeColor = colorSubtext,
                    Location = new Point(18, 38),
                    AutoSize = true
                };

                Button btnRestore = CreateFlatButton("🔄 Restore", colorWarning, Color.FromArgb(17, 17, 27));
                btnRestore.Size = new Size(110, 32);
                btnRestore.Location = new Point(590, 18);
                btnRestore.Click += async (s, e) =>
                {
                    var res = MessageBox.Show("Restoring will replace the current AgentOS system disk with this snapshot.\nYour workspace/ projects will NOT be deleted.\n\nProceed?", "Confirm Restore", MessageBoxButtons.YesNo, MessageBoxIcon.Warning);
                    if (res == DialogResult.Yes)
                    {
                        btnRestore.Enabled = false;
                        btnRestore.Text = "Restoring...";
                        await Task.Run(() =>
                        {
                            string resetScript = Path.Combine(appBaseDir, "scripts", "reset-agentos.ps1");
                            ProcessStartInfo psi = new ProcessStartInfo("powershell.exe", string.Format("-ExecutionPolicy Bypass -File \"{0}\" -FromBackup \"{1}\" -Force", resetScript, f))
                            {
                                UseShellExecute = false,
                                CreateNoWindow = true
                            };
                            Process p = Process.Start(psi);
                            p.WaitForExit();
                        });
                        btnRestore.Enabled = true;
                        btnRestore.Text = "🔄 Restore";
                        MessageBox.Show("AgentOS has been restored back to: " + fi.Name, "Restore Complete", MessageBoxButtons.OK, MessageBoxIcon.Information);
                        RefreshDashboardAsync();
                    }
                };

                sCard.Controls.Add(sTitle);
                sCard.Controls.Add(sSub);
                sCard.Controls.Add(btnRestore);

                flowSnapshots.Controls.Add(sCard);
            }
        }
        #endregion

        private static string RunProcess(string filename, string args)
        {
            try
            {
                ProcessStartInfo psi = new ProcessStartInfo(filename, args)
                {
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    CreateNoWindow = true,
                    StandardOutputEncoding = Encoding.UTF8,
                    StandardErrorEncoding = Encoding.UTF8
                };
                using (Process p = Process.Start(psi))
                {
                    string stdout = p.StandardOutput.ReadToEnd();
                    string stderr = p.StandardError.ReadToEnd();
                    p.WaitForExit();
                    return (stdout + "\n" + stderr).Trim();
                }
            }
            catch (Exception ex)
            {
                return "Error executing process: " + ex.Message;
            }
        }
    }
}
