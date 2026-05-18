# ============================================================
# GYMsos Frontend Skill Ecosystem — Claude Code Installer
# ============================================================
# Installs the premium frontend skill system into ~/.claude/
# Run from PowerShell: .\install.ps1
# ============================================================

$ErrorActionPreference = "Stop"

# ── Paths ──────────────────────────────────────────────────
$SourceDir  = $PSScriptRoot                          # This script's directory
$ClaudeDir  = "$env:USERPROFILE\.claude"             # Target: C:\Users\HP\.claude
$SkillsDir  = "$ClaudeDir\skills"

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Claude Code — Premium Frontend Skill Ecosystem          ║" -ForegroundColor Cyan
Write-Host "║  Installing to: $ClaudeDir" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ── Step 1: Create ~/.claude directory if it doesn't exist ─
if (-Not (Test-Path $ClaudeDir)) {
    Write-Host "📁 Creating $ClaudeDir ..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $ClaudeDir -Force | Out-Null
    Write-Host "   ✅ Created" -ForegroundColor Green
} else {
    Write-Host "📁 Found existing $ClaudeDir" -ForegroundColor Green
}

# ── Step 2: Backup existing CLAUDE.md if present ───────────
$ClaudeMdTarget = "$ClaudeDir\CLAUDE.md"
if (Test-Path $ClaudeMdTarget) {
    $Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $BackupPath = "$ClaudeDir\CLAUDE.md.backup_$Timestamp"
    Write-Host "💾 Backing up existing CLAUDE.md → $BackupPath" -ForegroundColor Yellow
    Copy-Item $ClaudeMdTarget $BackupPath
    Write-Host "   ✅ Backed up" -ForegroundColor Green
}

# ── Step 3: Install CLAUDE.md ──────────────────────────────
Write-Host ""
Write-Host "📄 Installing global CLAUDE.md ..." -ForegroundColor Yellow
Copy-Item "$SourceDir\CLAUDE.md" "$ClaudeDir\CLAUDE.md" -Force
Write-Host "   ✅ Installed CLAUDE.md" -ForegroundColor Green

# ── Step 4: Install settings.json ─────────────────────────
$SettingsTarget = "$ClaudeDir\settings.json"
if (-Not (Test-Path $SettingsTarget)) {
    Write-Host ""
    Write-Host "⚙️  Installing settings.json ..." -ForegroundColor Yellow
    Copy-Item "$SourceDir\settings.json" $SettingsTarget -Force
    Write-Host "   ✅ Installed settings.json" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚙️  settings.json already exists — skipping (preserving your config)" -ForegroundColor DarkYellow
    Write-Host "   ℹ️  Reference: $SourceDir\settings.json" -ForegroundColor DarkGray
}

# ── Step 5: Create skills directory ────────────────────────
Write-Host ""
Write-Host "📂 Setting up skills directory ..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $SkillsDir -Force | Out-Null
Write-Host "   ✅ $SkillsDir" -ForegroundColor Green

# ── Step 6: Install all skill SKILL.md files ───────────────
Write-Host ""
Write-Host "🎨 Installing skills ..." -ForegroundColor Yellow

$Skills = @(
    @{ Name = "framer-motion";         Tier = "SSS"; Icon = "🎬" },
    @{ Name = "aceternity-ui";         Tier = "SSS"; Icon = "✨" },
    @{ Name = "premium-layout-system"; Tier = "SSS"; Icon = "🏛️" },
    @{ Name = "motion-system";         Tier = "SS";  Icon = "🎭" },
    @{ Name = "animation-designer";    Tier = "SS";  Icon = "🎯" },
    @{ Name = "gsap";                  Tier = "SS";  Icon = "⚡" },
    @{ Name = "lenis";                 Tier = "SS";  Icon = "🌊" },
    @{ Name = "shadcn-ui";             Tier = "S";   Icon = "🧱" },
    @{ Name = "frontend-design-pro";   Tier = "S";   Icon = "🔧" }
)

$Installed = 0
$Failed = 0

foreach ($Skill in $Skills) {
    $SkillSource = "$SourceDir\skills\$($Skill.Name)\SKILL.md"
    $SkillTarget = "$SkillsDir\$($Skill.Name)"
    $SkillFile   = "$SkillTarget\SKILL.md"

    if (Test-Path $SkillSource) {
        New-Item -ItemType Directory -Path $SkillTarget -Force | Out-Null
        Copy-Item $SkillSource $SkillFile -Force
        Write-Host "   $($Skill.Icon) [TIER $($Skill.Tier)] $($Skill.Name)" -ForegroundColor Green
        $Installed++
    } else {
        Write-Host "   ❌ MISSING: $SkillSource" -ForegroundColor Red
        $Failed++
    }
}

# ── Step 7: Summary ────────────────────────────────────────
Write-Host ""
Write-Host "══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Installation Summary" -ForegroundColor White
Write-Host ""
Write-Host "  ✅ Skills installed:  $Installed / $($Skills.Count)" -ForegroundColor Green
if ($Failed -gt 0) {
    Write-Host "  ❌ Skills failed:    $Failed" -ForegroundColor Red
}
Write-Host ""
Write-Host "  📍 Installed to: $ClaudeDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Skill Hierarchy:" -ForegroundColor White
Write-Host "    TIER SSS  framer-motion, aceternity-ui, premium-layout-system" -ForegroundColor Magenta
Write-Host "    TIER SS   motion-system, animation-designer, gsap, lenis" -ForegroundColor Blue
Write-Host "    TIER S    shadcn-ui, frontend-design-pro" -ForegroundColor DarkCyan
Write-Host ""
Write-Host "══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "  🚀 Done! Restart Claude Code to activate." -ForegroundColor Green
Write-Host ""

# ── Verify installation ─────────────────────────────────────
Write-Host "Verification — installed files:" -ForegroundColor DarkGray
Get-ChildItem $ClaudeDir -Recurse -Filter "*.md" | ForEach-Object {
    $RelativePath = $_.FullName.Replace("$ClaudeDir\", "")
    Write-Host "  📄 $RelativePath" -ForegroundColor DarkGray
}
Write-Host ""
