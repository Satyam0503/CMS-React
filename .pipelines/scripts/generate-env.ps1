# Generate .env file for Vite
# Usage: .\generate-env.ps1 -OutputPath "C:\path\to\dist" -BaseUrl "http://api.example.com" -CaptchaSiteKey "key" -I18nConfigKey "config"

param(
    [Parameter(Mandatory=$true)]
    [string]$OutputPath,

    [Parameter(Mandatory=$true)]
    [string]$BaseUrl,

    [Parameter(Mandatory=$true)]
    [string]$CaptchaSiteKey,

    [Parameter(Mandatory=$true)]
    [string]$I18nConfigKey
)

Write-Host "Generating .env file for Vite"
Write-Host "Output Path: $OutputPath"

$envContent = @"
VITE_BASEURL=$BaseUrl
VITE_CAPTCHA_SITE_KEY=$CaptchaSiteKey
VITE_APP_I18N_CONFIG_KEY=$I18nConfigKey
"@

$outputFile = Join-Path $OutputPath ".env"
$envContent | Out-File $outputFile -Encoding UTF8

Write-Host "✅ .env file generated successfully at: $outputFile"
