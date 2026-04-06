# GitHub Packages Authentication Setup
# Replace with your actual credentials

$env:GPR_USER = "your_github_username"
$env:GPR_KEY = "your_github_personal_access_token"

Write-Host "Environment variables set:" -ForegroundColor Green
Write-Host "GPR_USER = $env:GPR_USER"
Write-Host "GPR_KEY = $(('*' * ($env:GPR_KEY.Length - 4)) + $env:GPR_KEY.Substring($env:GPR_KEY.Length - 4))"

Write-Host "`nStarting build..." -ForegroundColor Green
npx expo run:android
