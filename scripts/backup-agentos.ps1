[CmdletBinding()]
param (
    [string]$BackupName
)

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
if (-not $BackupName) {
    $BackupName = "AgentOS-backup-$timestamp.tar"
} elseif (-not $BackupName.EndsWith(".tar")) {
    $BackupName = "$BackupName-$timestamp.tar"
}

$backupDir = "$PSScriptRoot\..\backups"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

$destPath = "$backupDir\$BackupName"

Write-Host "Shutting down AgentOS for consistent snapshot..." -ForegroundColor Yellow
wsl.exe -t AgentOS

Write-Host "Exporting AgentOS to $destPath ..." -ForegroundColor Cyan
wsl.exe --export AgentOS $destPath

if (Test-Path $destPath) {
    $sizeMB = [math]::Round((Get-Item $destPath).Length / 1MB, 2)
    Write-Host "Snapshot successfully created! Size: $sizeMB MB" -ForegroundColor Green
    Write-Host "Location: $destPath" -ForegroundColor Green
} else {
    Write-Host "Failed to create snapshot." -ForegroundColor Red
}
