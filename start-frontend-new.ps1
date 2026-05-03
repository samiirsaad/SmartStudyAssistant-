$frontendPath = "c:\Users\a\SmartStudyAssistant\frontend"
Set-Location $frontendPath
Write-Host "📁 Frontend Directory: $frontendPath" -ForegroundColor Cyan
Write-Host "Starting React Development Server..." -ForegroundColor Green
Write-Host "🌐 Will open: http://localhost:3000" -ForegroundColor Cyan

# Set environment variables
$env:SKIP_PREFLIGHT_CHECK = 'true'
$env:GENERATE_SOURCEMAP = 'false'

# Try using node directly with react-scripts from the local node_modules
if (Test-Path ".\node_modules\.bin\react-scripts.cmd") {
    Write-Host "✓ Using local react-scripts" -ForegroundColor Green
    & ".\node_modules\.bin\react-scripts.cmd" start
} else {
    Write-Host "✗ Local react-scripts not found, using npx..." -ForegroundColor Yellow
    & npx react-scripts start
}
