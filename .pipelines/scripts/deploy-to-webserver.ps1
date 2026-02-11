param(
    [Parameter(Mandatory=$true)]
    [string]$SiteName,

    [Parameter(Mandatory=$true)]
    [string]$PhysicalPath,

    [Parameter(Mandatory=$true)]
    [string]$SourcePath,

    [Parameter(Mandatory=$false)]
    [int]$Port = 80
)

Import-Module WebAdministration

Write-Host "Starting frontend deployment..."
Write-Host "Site Name: $SiteName"
Write-Host "Physical Path: $PhysicalPath"
Write-Host "Source Path: $SourcePath"

# Create Physical Directory if it doesn't exist
if (-not (Test-Path $PhysicalPath)) {
    Write-Host "Creating physical directory: $PhysicalPath"
    New-Item -Path $PhysicalPath -ItemType Directory -Force
}

# Backup existing deployment
if (Test-Path "$PhysicalPath\*") {
    $backupPath = "$PhysicalPath-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Write-Host "Creating backup at: $backupPath"
    Copy-Item -Path $PhysicalPath -Destination $backupPath -Recurse -Force
}

# Copy files
Write-Host "Copying files from $SourcePath to $PhysicalPath"
Remove-Item -Path "$PhysicalPath\*" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "$SourcePath\*" -Destination $PhysicalPath -Recurse -Force

# Check if Website exists
$siteExists = Get-Website -Name $SiteName -ErrorAction SilentlyContinue
if (-not $siteExists) {
    Write-Host "Creating IIS Website: $SiteName"
    New-Website -Name $SiteName -PhysicalPath $PhysicalPath -Port $Port
}

# Create web.config for SPA routing
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

$webConfig | Out-File "$PhysicalPath\web.config" -Encoding UTF8

Write-Host "Frontend deployment completed successfully!"
