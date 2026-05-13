@echo off
cd /d "C:\botas\Documentación__"
echo Cerrando procesos git anteriores...
taskkill /f /im cmd.exe /fi "WINDOWTITLE ne _push2*" 2>nul
timeout /t 1 /nobreak >nul
del /f ".git\index.lock" 2>nul
echo.
git add -A
git commit -m "feat(fase-2): agregar AGEN_2.md prompt maestro de valor agregado y unicornio"
git push origin main
echo.
echo === LISTO - GitHub actualizado ===
git log --oneline -3
echo.
echo Puedes cerrar esta ventana.
pause
