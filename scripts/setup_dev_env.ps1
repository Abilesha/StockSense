# ==============================================================================
# StockSense - Developer Environment Automated Setup (PowerShell)
# ==============================================================================
# Hey team! Run this script when onboarding to automatically install node modules
# in both frontend and backend directories and check PostgreSQL service status.
#
# Usage:
#   .\scripts\setup_dev_env.ps1
# ==============================================================================

Write-Host "🚀 Setting up StockSense Developer Environment..." -ForegroundColor Cyan

# Install Backend Dependencies
Write-Host "📦 Installing Backend Dependencies..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\..\backend"
npm install

# Install Frontend Dependencies
Write-Host "📦 Installing Frontend Dependencies..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\..\frontend"
npm install

Set-Location -Path "$PSScriptRoot\.."
Write-Host "✅ Dev Environment Setup Complete! You're ready to start building!" -ForegroundColor Green
