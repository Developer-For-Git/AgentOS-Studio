@echo off
cd /d "%~dp0desktop"
if exist "%~dp0desktop\node_modules\electron\dist\electron.exe" (
    start "" "%~dp0desktop\node_modules\electron\dist\electron.exe" "%~dp0desktop"
) else (
    npm start
)
