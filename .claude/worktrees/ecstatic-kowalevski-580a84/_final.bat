@echo off
cd /d "C:\botas\Documentación__"
del /f ".git\index.lock" 2>nul
del /f ".git\HEAD.lock" 2>nul
del /f ".git\COMMIT_EDITMSG.lock" 2>nul
git add -A
git commit -m "docs(claude-md): protocolo autopush definitivo con cp index + token en remote"
git push origin main
echo === DONE ===
