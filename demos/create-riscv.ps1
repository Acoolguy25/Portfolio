# PowerShell script to download a folder from a GitHub repository and copy it to a destination

# Configuration
$repoUrl = "https://github.com/Acoolguy25/riscv-web-emulator.git" # Repository URL
$folderPath = "wasm/web" # Folder to download from the repository
$destinationPath = "~\Documents\WinProjects\portfolio\demos" # Destination to copy the folder
$tempDir = "$env:TEMP\riscv-web-emulator-temp" # Temporary directory for cloning
$branch = "main" # Branch to clone (change if needed, e.g., "master")

# Ensure git is installed
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
 Write-Error "Git is not installed. Please install Git and try again."
 exit 1
}

# Create temporary directory if it doesn't exist
if (-not (Test-Path $tempDir)) {
 New-Item -ItemType Directory -Path $tempDir | Out-Null
}

# Change to temporary directory
Set-Location $tempDir

# Initialize a new git repository
git init

# Enable sparse-checkout
git sparse-checkout init --cone

# Specify the folder to download
git sparse-checkout set $folderPath

# Add the remote repository
git remote add origin $repoUrl

# Fetch the specified branch and folder
git fetch origin $branch
if ($LASTEXITCODE -ne 0) {
 Write-Error "Failed to fetch from repository. Check the URL, branch, or access permissions."
 exit 1
}

# Checkout the branch (only downloads the specified folder)
git checkout $branch
if ($LASTEXITCODE -ne 0) {
 Write-Error "Failed to checkout branch $branch."
 exit 1
}

# Create destination directory if it doesn't exist
if (-not (Test-Path $destinationPath)) {
 New-Item -ItemType Directory -Path $destinationPath | Out-Null
}

# Copy the folder to the destination
Copy-Item -Path "$tempDir\$folderPath" -Destination $destinationPath -Recurse -Force
if ($LASTEXITCODE -ne 0) {
 Write-Error "Failed to copy folder to $destinationPath."
 exit 1
}
Remove-Item -Path "$destinationPath\riscv" -Recurse -Force
Rename-Item -Path "$destinationPath\web" -NewName "riscv" -Force

# Clean up temporary directory
Set-Location $env:TEMP
Remove-Item -Path $tempDir -Recurse -Force

Write-Host "Successfully copied $folderPath from $repoUrl to $destinationPath"