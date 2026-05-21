param (
    [string]$Target
)

if (-not $Target) {
    Write-Host "Uso: .\run_audit.ps1 -Target <url_o_ip_objetivo>" -ForegroundColor Yellow
    Exit
}

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "    EJECUTANDO ESCANEO DE SEGURIDAD EN ENTORNO LOCAL (.CLAUDE/SKILLS)" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

# Llama al ejecutable local directo que acabamos de descargar
cd C:\botas\Documentación__\.claude\skills\auditing_engines
.\nuclei.exe -target $Target -t "C:\botas\Documentación__\.claude\skills\auditing_engines\nuclei-templates\"
