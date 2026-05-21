#!/bin/bash

# ==============================================================================
# MASTER CYBERSECURITY DEFENSE & AUDITING ENVIRONMENT INSTALLER
# ==============================================================================

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}[*] Iniciando el despliegue del entorno de blindaje y auditoría...${NC}"

# 1. Actualización del Sistema e Instalación de Dependencias Básicas
echo -e "${YELLOW}[1/6] Actualizando el sistema e instalando dependencias (Git, Go, Curl)...${NC}"
sudo apt update -qq && sudo apt install -y git curl wget make gcc snapd golang-go 2>&1 | tail -5

# Verificar Go
if ! command -v go &> /dev/null; then
    echo -e "${YELLOW}[!] Instalando GoLang de forma automática...${NC}"
    sudo apt install -y golang-go
fi
echo "Go version: $(go version 2>/dev/null || echo 'no disponible')"

# 2. Creación del Directorio Maestro
echo -e "${YELLOW}[2/6] Creando estructura jerárquica en /opt/cybersec_defense...${NC}"
sudo mkdir -p /opt/cybersec_defense/auditing_engines
sudo mkdir -p /opt/cybersec_defense/wordlists_payloads
sudo mkdir -p /opt/cybersec_defense/hardening_guides
sudo mkdir -p /opt/cybersec_defense/documentation
sudo chown -R $USER:$USER /opt/cybersec_defense

cd /opt/cybersec_defense

# ==============================================================================
# NIVEL 1: NUCLEI
# ==============================================================================
echo -e "${GREEN}[3/6] Instalando Nuclei Engine y Nuclei Templates...${NC}"
if ! command -v nuclei &> /dev/null; then
    GO111MODULE=on go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest 2>&1 | tail -3
    sudo cp ~/go/bin/nuclei /usr/local/bin/ 2>/dev/null || true
fi
echo "Nuclei: $(nuclei -version 2>&1 | head -1 || echo 'instalado via go')"

cd /opt/cybersec_defense/auditing_engines
if [ ! -d "nuclei-templates" ]; then
    git clone --depth 1 https://github.com/projectdiscovery/nuclei-templates.git 2>&1 | tail -3
else
    echo "nuclei-templates ya existe, actualizando..."
    git -C nuclei-templates pull --depth 1 2>&1 | tail -2
fi

# ==============================================================================
# NIVEL 2: SECLISTS
# ==============================================================================
echo -e "${GREEN}[4/6] Clonando SecLists...${NC}"
cd /opt/cybersec_defense/wordlists_payloads
if [ ! -d "SecLists" ]; then
    git clone --depth 1 https://github.com/danielmiessler/SecLists.git 2>&1 | tail -3
else
    echo "SecLists ya existe, actualizando..."
    git -C SecLists pull --depth 1 2>&1 | tail -2
fi

# ==============================================================================
# NIVEL 3: GUÍAS DE HARDENING
# ==============================================================================
echo -e "${GREEN}[5/6] Descargando guías de Hardening y OWASP...${NC}"
cd /opt/cybersec_defense/hardening_guides

if [ ! -d "CheatSheetSeries" ]; then
    git clone --depth 1 https://github.com/OWASP/CheatSheetSeries.git 2>&1 | tail -3
else
    echo "CheatSheetSeries ya existe"
fi

if [ ! -d "the-practical-linux-hardening-guide" ]; then
    git clone --depth 1 https://github.com/trimstray/the-practical-linux-hardening-guide.git 2>&1 | tail -3
else
    echo "linux-hardening-guide ya existe"
fi

# ==============================================================================
# NIVEL 4: DOCUMENTACIÓN
# ==============================================================================
echo -e "${GREEN}[6/6] Guardando recursos de Awesome AppSec...${NC}"
cd /opt/cybersec_defense/documentation
if [ ! -d "awesome-appsec" ]; then
    git clone --depth 1 https://github.com/paragonie/awesome-appsec.git 2>&1 | tail -3
else
    echo "awesome-appsec ya existe"
fi

# ==============================================================================
# SCRIPT DE AUDITORÍA INTEGRADO
# ==============================================================================
echo -e "${BLUE}[*] Creando script de auditoría integrada...${NC}"

cat << 'EOF' > /opt/cybersec_defense/run_audit.sh
#!/bin/bash
echo "======================================================================"
echo "    EJECUTANDO ESCANEO DE SEGURIDAD CON NUCLEI + SECLISTS"
echo "======================================================================"
if [ -z "$1" ]; then
    echo "Uso: ./run_audit.sh <url_o_ip_objetivo>"
    exit 1
fi
nuclei -target "$1" -t /opt/cybersec_defense/auditing_engines/nuclei-templates/
EOF

chmod +x /opt/cybersec_defense/run_audit.sh

# Crear script de resumen rápido de hardening
cat << 'EOF' > /opt/cybersec_defense/quick_hardening_check.sh
#!/bin/bash
echo "======================================================================"
echo "    VERIFICACIÓN RÁPIDA DE HARDENING DEL SISTEMA"
echo "======================================================================"
echo "[+] Firewall (ufw):"
sudo ufw status 2>/dev/null || echo "  ufw no instalado"
echo "[+] SSH config:"
grep -E "PermitRootLogin|PasswordAuthentication|Port " /etc/ssh/sshd_config 2>/dev/null || echo "  No encontrado"
echo "[+] Usuarios con shell:"
grep -v nologin /etc/passwd | grep -v false | grep -E "bash|sh$"
echo "[+] Puertos en escucha:"
ss -tlnp 2>/dev/null || netstat -tlnp 2>/dev/null
echo "======================================================================"
echo "Guías completas en: /opt/cybersec_defense/hardening_guides/"
EOF

chmod +x /opt/cybersec_defense/quick_hardening_check.sh

clear
echo -e "${GREEN}======================================================================${NC}"
echo -e "${GREEN}¡INSTALACIÓN Y CONFIGURACIÓN COMPLETADA CON ÉXITO!${NC}"
echo -e "${GREEN}======================================================================${NC}"
echo -e "${BLUE}Tu entorno está listo en: ${YELLOW}/opt/cybersec_defense${NC}"
echo ""
echo -e "${BLUE}Estructura del ecosistema creado:${NC}"
echo -e " ├── ${YELLOW}auditing_engines/${NC}    -> Nuclei Engine + Plantillas en tiempo real"
echo -e " ├── ${YELLOW}wordlists_payloads/${NC}  -> Base de datos SecLists completa"
echo -e " ├── ${YELLOW}hardening_guides/${NC}    -> OWASP CheatSheets + Linux Hardening Guide"
echo -e " ├── ${YELLOW}documentation/${NC}       -> Awesome AppSec"
echo -e " ├── ${GREEN}run_audit.sh${NC}         -> Motor de escaneo Nuclei integrado"
echo -e " └── ${GREEN}quick_hardening_check.sh${NC} -> Verificación rápida del sistema"
echo ""
echo -e "${YELLOW}Para auditar un objetivo autorizado:${NC}"
echo -e "  cd /opt/cybersec_defense && ./run_audit.sh https://tu-sitio.com"
echo ""
echo -e "${YELLOW}Para verificar el endurecimiento de este sistema:${NC}"
echo -e "  cd /opt/cybersec_defense && ./quick_hardening_check.sh"
echo -e "${GREEN}======================================================================${NC}"
