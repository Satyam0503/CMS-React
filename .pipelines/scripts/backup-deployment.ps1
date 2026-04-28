# Create backup of existing deployment
# Usage: .\backup-deployment.ps1 -Path "C:\inetpub\wwwroot\app"

param(
    [Parameter(Mandatory=$true)]
    [string]$Path
)

if (Test-Path $Path) {
    $timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $backupPath = "$Path-backup-$timestamp"

    Write-Host "📦 Creating backup of existing deployment"
    Write-Host "   Source: $Path"
    Write-Host "   Backup: $backupPath"

    Copy-Item -Path $Path -Destination $backupPath -Recurse -Force
    Write-Host "✅ Backup created successfully"
} else {
    Write-Host "ℹ️  No existing deployment to backup"
}
