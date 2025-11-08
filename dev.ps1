<#!
.SYNOPSIS
  Helper script to run the FastAPI backend on Windows using Uvicorn (no Gunicorn).
.DESCRIPTION
  Activates the virtual environment if present, loads optional dotenv, and starts Uvicorn
  pointing at the canonical backend package path. Falls back gracefully if venv missing.
#>

param(
  [int]$Port = 8000,
  [string]$Host = '127.0.0.1',
  [switch]$Shim
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoRoot

# Activate venv if exists
$venvActivate = Join-Path $repoRoot '.venv/Scripts/Activate.ps1'
if (Test-Path $venvActivate) {
  . $venvActivate
} else {
  Write-Warning 'No .venv found. Create one with: python -m venv .venv'
}

# Optional: load backend/.env into current process (simple parser: KEY=VALUE, no export)
$envFile = Join-Path $repoRoot 'backend/.env'
if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    if ($_ -match '^[A-Za-z_][A-Za-z0-9_]*=') {
      $kv = $_.Split('=',2)
      $name = $kv[0]
      $value = $kv[1]
      if (-not [string]::IsNullOrWhiteSpace($name)) { $env:$name = $value }
    }
  }
}

$module = if ($Shim) { 'app:app' } else { 'backend.app.main:app' }

Write-Host "Starting Uvicorn -> $module on http://$Host:$Port" -ForegroundColor Cyan
python -m uvicorn $module --reload --host $Host --port $Port
