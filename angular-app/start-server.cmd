@echo off
REM Wrapper to run the Angular dev server from the project folder (avoids quoting issues)
pushd "%~dp0"
npm run start
