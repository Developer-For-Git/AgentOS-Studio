[CmdletBinding()]
param (
    [string]$FromBackup,
    [switch]$Force
)

Write-Host "=======================================================" -ForegroundColor Red
Write-Host "               AgentOS Environment Reset              " -ForegroundColor Red
Write-Host "=======================================================" -ForegroundColor Red
Write-Host "WARNING: This will unregister AgentOS and reinstall it." -ForegroundColor Yellow
Write-Host "Note: Your files in 'workspace/' will NOT be deleted." -ForegroundColor Green

if (-not $Force) {
    $confirm = Read-Host "Type 'YES' to proceed with resetting AgentOS"
    if ($confirm -ne 'YES') {
        Write-Host "Reset canceled." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "Terminating and unregistering AgentOS..." -ForegroundColor Yellow
wsl.exe -t AgentOS 2>$null
wsl.exe --unregister AgentOS

$distroDir = "$PSScriptRoot\..\distro"
$sourceTar = $FromBackup
if (-not $sourceTar) {
    $sourceTar = "$PSScriptRoot\..\downloads\ubuntu-24.04-root.tar.xz"
}

if (-not (Test-Path $sourceTar)) {
    Write-Host "Error: Base image not found at $sourceTar" -ForegroundColor Red
    exit 1
}

Write-Host "Re-importing AgentOS from $sourceTar..." -ForegroundColor Cyan
wsl.exe --import AgentOS $distroDir $sourceTar --version 2

Write-Host "Reapplying configuration..." -ForegroundColor Cyan
# Re-apply wsl.conf
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

# Re-apply fstab
wsl.exe -d AgentOS -u root -- sh -c "echo 'C:/Users/LOL/Desktop/AIOS/workspace /workspace drvfs rw,noatime,uid=1000,gid=1000,umask=022,fmode=0755,dmode=0755 0 0' > /etc/fstab"

# Create agent user
wsl.exe -d AgentOS -u root -- sh -c "useradd -m -s /bin/bash -G sudo agent && echo 'agent ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/agent && chmod 0440 /etc/sudoers.d/agent"

# Copy agentos CLI
Get-Content -Raw "$PSScriptRoot\agentos-cli.sh" | wsl.exe -d AgentOS -u root -- sh -c "tr -d '\r' > /usr/local/bin/agentos && chmod +x /usr/local/bin/agentos"

wsl.exe -t AgentOS

Write-Host "AgentOS successfully reset!" -ForegroundColor Green
