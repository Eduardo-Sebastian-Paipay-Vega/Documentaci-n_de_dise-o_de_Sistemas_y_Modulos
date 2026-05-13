@echo off
cd /d "C:\botas\Documentación__"
del /f ".git\index.lock" 2>nul
del /f ".git\HEAD.lock" 2>nul
echo === Locks eliminados ===
git status
git add -A
git status
git commit -m "docs(claude-md): protocolo autopush definitivo con cp index + token en remote"
git push origin main
echo === RESULTADO FINAL ===
git log --oneline -3
pause
