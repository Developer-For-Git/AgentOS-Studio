Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "                AgentOS Status Monitor                 " -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

$distroState = (wsl.exe -l -v | Select-String "AgentOS")
Write-Host "WSL Distro State: $distroState" -ForegroundColor Yellow

Write-Host "`n[Distro Internal Health]" -ForegroundColor Green
wsl.exe -d AgentOS agentos info

Write-Host "`n[Virtual Hard Disk File]" -ForegroundColor Green
Get-ChildItem -Path "$PSScriptRoot\..\distro" | Select-Object Name, Length, LastWriteTime | Format-Table -AutoSize
