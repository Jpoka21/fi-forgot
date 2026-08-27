@echo off
setlocal
corepack pnpm --dir "%~dp0lib\orchestra-execution" exec tsx src\owner-cli-main.ts --repository "%~dp0." %*
exit /b %errorlevel%
