Stop-Process -Name "cmd" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1
$lock = "C:\botas\Documentacion__\.git\index.lock"
if (Test-Path $lock) { Remove-Item $lock -Force }
Set-Location "C:\botas\Documentacion__"
git add -A
git commit -m "chore(sync): limpiar archivos temporales de prueba"
git push origin main
