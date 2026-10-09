@echo off
title PHANTOM X - Threat Defense Command Center
setlocal

set "TOOLS_DIR=C:\Users\IIC LAB\Documents\tools"
set "PATH=%TOOLS_DIR%\python311\tools;%TOOLS_DIR%\python311\tools\Scripts;%TOOLS_DIR%\node-v20.18.0-win-x64;%PATH%"

echo ======================================================================
echo  Starting PHANTOM X Autonomous Threat Defense Platform...
echo ======================================================================

python run.py
pause
