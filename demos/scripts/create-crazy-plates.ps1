# Sync-CrazyPlatesBuild.ps1

# Set source and destination paths
$sourcePath = "C:\Users\ryanb\Documents\Unity\Crazy Plates\Builds\Web"
$destinationPath = "C:\Users\ryanb\Documents\WinProjects\portfolio\demos\crazy-plates\game"

# Change to source directory
Set-Location -Path $sourcePath
Write-Host "CDing into directory: $sourcePath"

# Ensure destination directory exists
if (-Not (Test-Path -Path $destinationPath)) {
    Write-Host "Destination path does not exist. Creating: $destinationPath"
    New-Item -ItemType Directory -Path $destinationPath | Out-Null
}

# Clear destination directory
Write-Host "Clearing destination directory..."
Get-ChildItem -Path $destinationPath -Recurse -Force | Remove-Item -Force -Recurse

# Copy all contents from source to destination
Write-Host "Copying files from source to destination..."
Copy-Item -Path "$sourcePath\*" -Destination $destinationPath -Recurse -Force
Move-Item -Path "$destinationPath\index.html" -Destination "$destinationPath\game.html" -Force

Write-Host "Done syncing Crazy Plates build." -ForegroundColor Green
