@echo off
echo Starting FinBot Backend...
cd /d "%~dp0"
npx tsx server/index.ts

