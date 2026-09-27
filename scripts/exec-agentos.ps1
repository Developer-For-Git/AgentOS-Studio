[CmdletBinding()]
param (
    [Parameter(Mandatory = $true, Position = 0, ValueFromRemainingArguments = $true)]
    [string[]]$Command,

    [string]$WorkingDir = "/workspace",

    [switch]$Root
)

$cmdString = $Command -join " "

if ($Root) {
    wsl.exe -d AgentOS -u root --cd $WorkingDir bash -lc "$cmdString"
} else {
    wsl.exe -d AgentOS --cd $WorkingDir bash -lc "$cmdString"
}
