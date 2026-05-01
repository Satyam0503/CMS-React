# Setup IIS Website for React SPA
# Usage: .\setup-iis-website.ps1 -SiteName "crm-test-app" -PhysicalPath "D:\Hosting\Codeji\crm-test-app" -HostName "testapp.codeji.in"

param(
    [Parameter(Mandatory=$true)]
    [string]$SiteName,

    [Parameter(Mandatory=$true)]
    [string]$PhysicalPath,

    [Parameter(Mandatory=$false)]
    [int]$Port = 80,

    [Parameter(Mandatory=$false)]
    [string]$HostName = "",

    [Parameter(Mandatory=$false)]
    [string]$AppPoolName = ""
)

if ([string]::IsNullOrWhiteSpace($AppPoolName)) {
    $AppPoolName = $SiteName
}

Write-Host "=========================================="
Write-Host "Setting up IIS Website for SPA: $SiteName"
Write-Host "  Pool: $AppPoolName"
Write-Host "  Path: $PhysicalPath"
Write-Host "  Binding: *:${Port}:${HostName}"
Write-Host "=========================================="

# Import WebAdministration module
Import-Module WebAdministration

# Create Physical Directory if it doesn't exist
if (-not (Test-Path $PhysicalPath)) {
    Write-Host "Creating physical directory: $PhysicalPath"
    New-Item -Path $PhysicalPath -ItemType Directory -Force | Out-Null
    Write-Host "Directory created"
} else {
    Write-Host "Physical directory already exists"
}

# Create Application Pool if it doesn't exist
$pool = Get-Item "IIS:\AppPools\$AppPoolName" -ErrorAction SilentlyContinue
if (-not $pool) {
    Write-Host "Creating IIS App Pool: $AppPoolName"
    New-WebAppPool -Name $AppPoolName | Out-Null
    Set-ItemProperty "IIS:\AppPools\$AppPoolName" -Name "managedRuntimeVersion" -Value ""
    Set-ItemProperty "IIS:\AppPools\$AppPoolName" -Name "startMode" -Value "AlwaysRunning"
    Write-Host "App Pool created (No Managed Code, AlwaysRunning)"
} else {
    Write-Host "App Pool already exists"
}

# Check if Website exists, create if not
$site = Get-Website -Name $SiteName -ErrorAction SilentlyContinue
if (-not $site) {
    Write-Host "Creating IIS Website: $SiteName"
    if ([string]::IsNullOrWhiteSpace($HostName)) {
        New-Website -Name $SiteName -PhysicalPath $PhysicalPath -Port $Port -ApplicationPool $AppPoolName | Out-Null
    } else {
        New-Website -Name $SiteName -PhysicalPath $PhysicalPath -Port $Port -HostHeader $HostName -ApplicationPool $AppPoolName | Out-Null
    }

    # Configure URL Rewrite for React SPA routing
    Write-Host "Configuring URL Rewrite for SPA routing"
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

    Write-Host "IIS Website created with SPA routing configuration"
} else {
    Write-Host "IIS Website already exists - reconciling pool, physical path, and bindings"

    # Ensure correct app pool
    Set-ItemProperty "IIS:\Sites\$SiteName" -Name "applicationPool" -Value $AppPoolName

    # Ensure correct physical path (root application of the site)
    $currentPath = (Get-WebFilePath "IIS:\Sites\$SiteName").FullName
    if ($currentPath -ne $PhysicalPath) {
        Write-Host "Updating physical path: $currentPath -> $PhysicalPath"
        Set-ItemProperty "IIS:\Sites\$SiteName" -Name "physicalPath" -Value $PhysicalPath
    }

    # Ensure expected binding exists
    $expectedBinding = if ([string]::IsNullOrWhiteSpace($HostName)) { "*:${Port}:" } else { "*:${Port}:${HostName}" }
    $bindings = Get-WebBinding -Name $SiteName -ErrorAction SilentlyContinue
    $hasBinding = $bindings | Where-Object { $_.bindingInformation -eq $expectedBinding -and $_.protocol -eq "http" }
    if (-not $hasBinding) {
        Write-Host "Adding missing binding: $expectedBinding"
        if ([string]::IsNullOrWhiteSpace($HostName)) {
            New-WebBinding -Name $SiteName -Protocol "http" -Port $Port | Out-Null
        } else {
            New-WebBinding -Name $SiteName -Protocol "http" -Port $Port -HostHeader $HostName | Out-Null
        }
    }
}

Write-Host "=========================================="
Write-Host "IIS configuration completed"
Write-Host "=========================================="
