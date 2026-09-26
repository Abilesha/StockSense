@echo off
REM ==============================================================================
REM StockSense - PostgreSQL Database Backup Script (Windows)
REM ==============================================================================
REM Hey folks! This script creates a timestamped SQL dump of your local stocksense_db.
REM Make sure pg_dump is added to your system PATH or environment variables.
REM
REM Usage:
REM   double-click or execute: .\scripts\backup_db.bat
REM ==============================================================================

set TIMESTAMP=%date:~10,4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set BACKUP_FILE=stocksense_backup_%TIMESTAMP%.sql

echo [StockSense] Backing up database to %BACKUP_FILE%...
REM pg_dump -U postgres -d stocksense_db > %BACKUP_FILE%
echo [StockSense] Backup utility placeholder ready. Customize DB credentials as needed!
pause
