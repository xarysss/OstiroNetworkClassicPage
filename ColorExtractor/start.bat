@echo off
echo ===================================================
echo Lancement du Backend ColorExtractor...
echo ===================================================
cd /d "%~dp0backend"
start cmd /k "node server.js"

echo ===================================================
echo Ouverture de l'interface Frontend dans le navigateur...
echo ===================================================
set "FRONTEND_PATH=%~dp0frontend\index.html"
start "" "%FRONTEND_PATH%"

echo Operation terminee.
