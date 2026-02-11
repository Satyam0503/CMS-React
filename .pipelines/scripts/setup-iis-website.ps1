# Setup IIS Website for React SPA
# Usage: .\setup-iis-website.ps1 -SiteName "codeji.dev.app" -PhysicalPath "C:\inetpub\wwwroot\app" -Port 80

param(
    [Parameter(Mandatory=$true)]
    [string]$SiteName,

    [Parameter(Mandatory=$true)]
    [string]$PhysicalPath,

    [Parameter(Mandatory=$true)]
    [int]$Port
)

Write-Host "=========================================="
Write-Host "Setting up IIS Website for SPA: $SiteName"
Write-Host "=========================================="

# Import WebAdministration module
Import-Module WebAdministration

# Create Physical Directory if it doesn't exist
if (-not (Test-Path $PhysicalPath)) {
    Write-Host "📁 Creating physical directory: $PhysicalPath"
    New-Item -Path $PhysicalPath -ItemType Directory -Force | Out-Null
    Write-Host "✅ Directory created"
} else {
    Write-Host "✅ Physical directory already exists"
}

# Check if Website exists, create if not
$site = Get-Website -Name $SiteName -ErrorAction SilentlyContinue
if (-not $site) {
    Write-Host "🌐 Creating IIS Website: $SiteName on port $Port"
    New-Website -Name $SiteName -PhysicalPath $PhysicalPath -Port $Port | Out-Null

    # Configure URL Rewrite for React SPA routing
    Write-Host "⚙️  Configuring URL Rewrite for SPA routing"
    $webConfig = @"
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
        <rewrite>
            <rules>
                <rule name="React Routes" stopProcessing="true">
                    <match url=".*" />
                    <conditions logicalGrouping="MatchAll">
                        <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
                        <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
                    </conditions>
                    <action type="Rewrite" url="/" />
                </rule>
            </rules>
        </rewrite>
        <staticContent>
            <mimeMap fileExtension=".json" mimeType="application/json" />
            <mimeMap fileExtension=".woff" mimeType="application/font-woff" />
            <mimeMap fileExtension=".woff2" mimeType="application/font-woff2" />
        </staticContent>
        <httpCompression>
            <dynamicTypes>
                <add mimeType="application/json" enabled="true" />
            </dynamicTypes>
        </httpCompression>
    </system.webServer>
</configuration>
"@
    $webConfig | Out-File "$PhysicalPath\web.config" -Encoding UTF8 -Force

    Write-Host "✅ IIS Website created with SPA routing configuration"
} else {
    Write-Host "✅ IIS Website already exists"
}

Write-Host "=========================================="
Write-Host "✅ IIS configuration completed"
Write-Host "=========================================="
