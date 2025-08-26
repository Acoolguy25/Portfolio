# Sync-CrazyPlatesBuild.ps1

# Set source and destination paths
$sourcePath = "C:\Users\ryanb\Documents\Unity\Crazy Plates\Builds\Web"
$destinationPath = "C:\Users\ryanb\Documents\WinProjects\portfolio\demos\crazy-plates\game"

# Set maximum part size (in bytes; adjust as needed, e.g., 100MB for GitHub limits)
$maxPartSize = 25 * 1024 * 1024  # 100 MB

# Function to split a file into parts
function Split-File {
    param (
        [string]$InputFile,
        [string]$OutputPrefix,
        [int]$Parts
    )

    $fileInfo = Get-Item $InputFile
    $fileSize = $fileInfo.Length
    $partSize = [math]::Ceiling($fileSize / $Parts)
    $buffer = New-Object byte[] $partSize
    $fileStream = [System.IO.File]::OpenRead($InputFile)
    $partNumber = 1

    Write-Host "Splitting $InputFile into $Parts parts..."

    while ($fileStream.Position -lt $fileStream.Length) {
        $bytesRead = $fileStream.Read($buffer, 0, $partSize)
        $outputFile = "$OutputPrefix.part$partNumber"
        $outputStream = [System.IO.File]::OpenWrite($outputFile)
        $outputStream.Write($buffer, 0, $bytesRead)
        $outputStream.Close()
        Write-Host "Created $outputFile ($bytesRead bytes)"
        $partNumber++
    }

    $fileStream.Close()
}

# Function to create or update wasm-fetch-override.js
function Create-WasmFetchOverride {
    param (
        [string]$Path,
        [int]$Parts
    )

    if ([string]::IsNullOrEmpty($Path)) {
        Write-Host "Path for wasm-fetch-override.js is empty. Skipping creation." -ForegroundColor Red
        return
    }

    $overrideContent = @"
// wasm-fetch-override.js

// Override window.fetch to intercept and spoof the Web.wasm request
const originalFetch = window.fetch;
window.fetch = async function(url, options) {
    if (typeof url === 'string' && url.endsWith('Web.wasm')) {
        console.log('Intercepting fetch for Web.wasm:', url);

        const wasmParts = [];
        for (let i = 1; i <= $Parts; i++) {
            wasmParts.push(``Build/Web.wasm.part`${i}``);
        }

        try {
            // Fetch all parts concurrently
            const responses = await Promise.all(
                wasmParts.map(part => originalFetch(part))
            );

            // Verify all responses are successful
            for (const response of responses) {
                if (!response.ok) {
                    throw new Error(``Failed to fetch `${response.url}: `${response.statusText}``);
                }
            }

            // Convert responses to ArrayBuffers
            const buffers = await Promise.all(
                responses.map(response => response.arrayBuffer())
            );

            // Calculate total size for the concatenated buffer
            const totalSize = buffers.reduce((sum, buffer) => sum + buffer.byteLength, 0);

            // Create a single ArrayBuffer to hold all parts
            const concatenated = new Uint8Array(totalSize);
            let offset = 0;

            // Copy each buffer into the concatenated array
            for (const buffer of buffers) {
                concatenated.set(new Uint8Array(buffer), offset);
                offset += buffer.byteLength;
            }

            // Create a Blob from the concatenated buffer
            const wasmBlob = new Blob([concatenated], { type: 'application/wasm' });

            // Return a spoofed Response object
            return new Response(wasmBlob, {
                status: 200,
                statusText: 'OK',
                headers: { 'Content-Type': 'application/wasm' }
            });
        } catch (error) {
            console.error("Error reassembling WASM:", error);
            return new Response(null, { status: 500, statusText: error.message });
        }
    }

    // For all other requests, use the original fetch
    return originalFetch.apply(this, arguments);
};

console.log('wasm-fetch-override.js loaded and fetch overridden.');
"@

    Write-Host "Creating or updating wasm-fetch-override.js at $Path..."
    Set-Content -Path $Path -Value $overrideContent -Force
}

# Change to source directory
Set-Location -Path $sourcePath
Write-Host "CDing into directory: $sourcePath"

# Ensure destination directory exists
if (-Not (Test-Path -Path $destinationPath)) {
    Write-Host "Destination path does not exist. Creating: $destinationPath"
    New-Item -ItemType Directory -Path $destinationPath | Out-Null
}

# Clear only the Build directory in the destination
$buildPath = Join-Path -Path $destinationPath -ChildPath "Build"
if (Test-Path -Path $buildPath) {
    Write-Host "Clearing Build directory: $buildPath..."
    Get-ChildItem -Path $buildPath -Recurse -Force | Remove-Item -Force -Recurse
} else {
    Write-Host "Creating Build directory: $buildPath..."
    New-Item -ItemType Directory -Path $buildPath | Out-Null
}

# Copy all contents from source to destination
Write-Host "Copying files from source to destination..."
Copy-Item -Path "$sourcePath\*" -Destination $destinationPath -Recurse -Force

# Rename index.html to game.html if it exists
$indexHtml = Join-Path -Path $destinationPath -ChildPath "index.html"
$gameHtml = Join-Path -Path $destinationPath -ChildPath "game.html"
if (Test-Path -Path $indexHtml) {
    Write-Host "Renaming index.html to game.html..."
    Move-Item -Path $indexHtml -Destination $gameHtml -Force
} elseif (-not (Test-Path -Path $gameHtml)) {
    Write-Host "No index.html found in source, and no existing game.html. Ensure source build includes index.html." -ForegroundColor Red
}

# Inject wasm-fetch-override.js script into game.html before </head>
if (Test-Path -Path $gameHtml) {
    Write-Host "Injecting <script src='wasm-fetch-override.js'></script> into game.html before </head>..."
    $content = Get-Content -Path $gameHtml -Raw
    $scriptTag = "<script src='wasm-fetch-override.js'></script>"
    $content = $content -replace '(?i)</head>', "$scriptTag</head>"
    Set-Content -Path $gameHtml -Value $content -NoNewline
}

# Determine number of parts for Web.wasm based on max part size
$wasmFile = Join-Path -Path $destinationPath -ChildPath "Build\Web.wasm"
$wasmOutputPrefix = Join-Path -Path $destinationPath -ChildPath "Build\Web.wasm"
if (Test-Path -Path $wasmFile) {
    $fileSize = (Get-Item $wasmFile).Length
    $parts = [math]::Ceiling($fileSize / $maxPartSize)
    if ($parts -lt 1) { $parts = 1 }

    # Create or update wasm-fetch-override.js with dynamic parts
    $overridePath = Join-Path -Path $destinationPath -ChildPath "wasm-fetch-override.js"
    Create-WasmFetchOverride -Path $overridePath -Parts $parts

    # Split the file
    Split-File -InputFile $wasmFile -OutputPrefix $wasmOutputPrefix -Parts $parts
    Write-Host "Removing original Web.wasm file..."
    Remove-Item -Path $wasmFile -Force
} else {
    Write-Host "Web.wasm not found at $wasmFile" -ForegroundColor Red
}

Write-Host "Done syncing and splitting Crazy Plates build." -ForegroundColor Green