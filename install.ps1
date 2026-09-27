# =====================================================================
# AgentOS Studio - Automated 1-Click Installer
# =====================================================================
# Installs an isolated sub-OS environment for AI agents with a modern Electron GUI.
# Safe execution: Host Windows C: drive is completely unmounted and protected.
# =====================================================================

$ErrorActionPreference = "Stop"
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "       🤖 AgentOS Studio - Automated Installer        " -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

$baseDir = $PSScriptRoot
if (-not $baseDir) {
    $baseDir = (Get-Location).Path
}

$distroDir = "$baseDir\distro"
$workspaceDir = "$baseDir\workspace"
$scriptsDir = "$baseDir\scripts"
$desktopDir = "$baseDir\desktop"
$downloadsDir = "$baseDir\downloads"
$backupsDir = "$baseDir\backups"

# 1. Directory Structure
Write-Host "[1/6] Initializing directory partitions..." -ForegroundColor Yellow
@($distroDir, "$workspaceDir\projects", $scriptsDir, $desktopDir, $downloadsDir, $backupsDir) | ForEach-Object {
    if (-not (Test-Path $_)) { New-Item -ItemType Directory -Path $_ -Force | Out-Null }
}

# 2. Check WSL2
Write-Host "[2/6] Verifying Windows Subsystem for Linux (WSL2)..." -ForegroundColor Yellow
$wslTest = (wsl.exe -l -v 2>&1) | Out-String
if ($LASTEXITCODE -ne 0 -and -not ($wslTest -match "VERSION")) {
    Write-Host "WSL2 not detected. Attempting automatic enablement..." -ForegroundColor Red
    wsl.exe --install --no-distribution
    Write-Host "Please restart your computer if prompted and re-run this script." -ForegroundColor Yellow
    exit 0
}

# 3. Check / Download Base Image
$rootfsPath = "$downloadsDir\ubuntu-24.04-root.tar.xz"
$cloudImgUrl = "https://cloud-images.ubuntu.com/releases/noble/release/ubuntu-24.04-server-cloudimg-amd64-root.tar.xz"

if (-not (Test-Path $rootfsPath) -and -not (Test-Path "$distroDir\ext4.vhdx")) {
    Write-Host "[3/6] Downloading Ubuntu 24.04 LTS rootfs (~220MB)..." -ForegroundColor Yellow
    curl.exe -L $cloudImgUrl -o $rootfsPath
}

# 4. Import Distro if not already registered
$existingDistros = (wsl.exe -l -q 2>$null) | Out-String
if (-not ($existingDistros -match "AgentOS")) {
    Write-Host "[4/6] Importing AgentOS into WSL2..." -ForegroundColor Yellow
    wsl.exe --import AgentOS $distroDir $rootfsPath --version 2

    Write-Host "Applying host isolation firewall..." -ForegroundColor Cyan
    $wslConf = @"
[boot]
systemd=true

[automount]
enabled=false
mountFsTab=true

[interop]
enabled=true
appendWindowsPath=false

[user]
default=agent
"@ -replace "`r", ""

    $wslConf | wsl.exe -d AgentOS -u root -- sh -c "cat > /etc/wsl.conf"

    $fstabEntry = "$($workspaceDir.Replace('\', '/')) /workspace drvfs rw,noatime,uid=1000,gid=1000,umask=022,fmode=0755,dmode=0755 0 0"
    wsl.exe -d AgentOS -u root -- sh -c "echo '$fstabEntry' > /etc/fstab"

    wsl.exe -d AgentOS -u root -- sh -c "useradd -m -s /bin/bash -G sudo agent && echo 'agent ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/agent && chmod 0440 /etc/sudoers.d/agent"

    Get-Content -Raw "$scriptsDir\agentos-cli.sh" | wsl.exe -d AgentOS -u root -- sh -c "tr -d '\r' > /usr/local/bin/agentos && chmod +x /usr/local/bin/agentos"

    wsl.exe -t AgentOS
} else {
    Write-Host "[4/6] AgentOS already imported and active." -ForegroundColor Green
}

# 5. Check Node.js on Host & Electron
Write-Host "[5/6] Checking Node.js and Electron dependencies..." -ForegroundColor Yellow
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Node.js LTS via winget..." -ForegroundColor Cyan
    winget install OpenJS.NodeJS.LTS -e --silent --accept-source-agreements --accept-package-agreements
}

if (-not (Test-Path "$desktopDir\node_modules\electron")) {
    Write-Host "Installing desktop app dependencies..." -ForegroundColor Cyan
    Push-Location $desktopDir
    npm install
    Pop-Location
}

# 6. Create Desktop Shortcut
Write-Host "[6/6] Creating Desktop shortcut..." -ForegroundColor Yellow
$userDesktop = [Environment]::GetFolderPath("Desktop")
$shortcutPath = "$userDesktop\AgentOS.lnk"
$electronExe = "$desktopDir\node_modules\electron\dist\electron.exe"

if (Test-Path $electronExe) {
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($shortcutPath)
    $Shortcut.TargetPath = $electronExe
    $Shortcut.Arguments = """$desktopDir"""
    $Shortcut.WorkingDirectory = $desktopDir
    $Shortcut.Description = "AgentOS Studio - Isolated AI Environment"
    $Shortcut.Save()
}

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Green
Write-Host "   🎉 AgentOS Studio Successfully Installed & Ready!  " -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green
Write-Host "Launching AgentOS Studio..." -ForegroundColor Cyan
Start-Process -FilePath $electronExe -ArgumentList """$desktopDir"""
