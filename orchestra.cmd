@echo off
setlocal
set "ORCHESTRA_SHARED=C:\Users\James.Massaro\Projects\orchestra-2"
if not exist "%ORCHESTRA_SHARED%\src\project-entry.ts" (
  echo Shared Orchestra controller is missing at "%ORCHESTRA_SHARED%". 1>&2
  exit /b 1
)
node "%ORCHESTRA_SHARED%\src\project-entry.ts" "%~dp0." %*
exit /b %errorlevel%
