' AutoPush silencioso a GitHub - sin ninguna ventana
Set oShell = CreateObject("WScript.Shell")

' 1. Cerrar cmd.exe abiertos que tengan el repo bloqueado
oShell.Run "taskkill /f /im cmd.exe", 0, True
WScript.Sleep 1500

' 2. Git push completamente oculto (windowStyle = 0)
oShell.Run "cmd /c cd /d ""C:\botas\Documentaci\xF3n__"" && del /f "".git\index.lock"" 2>nul && git add -A && git commit -m ""chore(sync): autopush automatico"" && git push origin main >> ""C:\botas\Documentaci\xF3n__\_push.log"" 2>&1", 0, True
