Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

pyinstaller `
  --noconfirm `
  --clean `
  --windowed `
  --name "FileNest" `
  --add-data "templates;templates" `
  desktop_app.py

Write-Host "Build complete. EXE: $PSScriptRoot\dist\FileNest\FileNest.exe"
