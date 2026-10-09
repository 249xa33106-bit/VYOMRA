@echo off
title Deploy PHANTOM X to Firebase Hosting
setlocal

set "TOOLS_DIR=C:\Users\IIC LAB\Documents\tools"
set "PATH=%TOOLS_DIR%\python311\tools;%TOOLS_DIR%\python311\tools\Scripts;%TOOLS_DIR%\node-v20.18.0-win-x64;%PATH%"

echo ======================================================================
echo   PHANTOM X - Firebase Hosting Deployment
echo   Target Project: phantom-x-efb92
echo ======================================================================

echo [1/2] Checking Firebase Login...
call npx --package firebase-tools firebase login

echo [2/2] Deploying frontend build to Firebase Hosting...
call npx --package firebase-tools firebase deploy --only hosting

echo ======================================================================
echo   Deployment completed!
echo   Live URL: https://phantom-x-efb92.web.app
echo ======================================================================
pause
