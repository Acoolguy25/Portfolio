// wasm-fetch-override.js

// Override window.fetch to intercept and spoof the Web.wasm request
const originalFetch = window.fetch;
window.fetch = async function(url, options) {
    if (typeof url === 'string' && url.endsWith('Web.wasm')) {
        console.log('Intercepting fetch for Web.wasm:', url);

        const wasmParts = [];
        for (let i = 1; i <= 6; i++) {
            wasmParts.push(`Build/Web.wasm.part${i}`);
        }

        try {
            // Fetch all parts concurrently
            const responses = await Promise.all(
                wasmParts.map(part => originalFetch(part))
            );

            // Verify all responses are successful
            for (const response of responses) {
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${response.url}: ${response.statusText}`);
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
