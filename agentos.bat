@echo off
title AgentOS Terminal (Isolated AI Environment)
echo =======================================================
echo          AgentOS - Isolated AI Environment
echo =======================================================
echo.
wsl.exe -d AgentOS --cd /workspace bash -l
