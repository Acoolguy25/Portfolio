const iframe = document.getElementById("unity-frame");

function doneLoading(innerDoc){
    innerDoc.getElementById("unity-build-title").style.color = "white"
    img_elem = innerDoc.getElementById("unity-logo-title-footer")

const oldElem = innerDoc.getElementById("unity-logo-title-footer");
const newURL = "https://store.speedtree.com/site-assets/uploads/Unity-Logo-White.png";

// Create a new <img> element
const newImg = innerDoc.createElement("img");
newImg.src = newURL;
newImg.alt = "Unity Logo";
newImg.style.width = "67px";
newImg.style.height = "38px";
newImg.style.objectFit = "contain";
newImg.style.display = "block"; // to prevent layout issues
newImg.style.float = 'left';

// Replace the old element
oldElem.replaceWith(newImg);
}

iframe.addEventListener("load", () => {
    try {
        const innerDoc = iframe.contentDocument || iframe.contentWindow.document;
        const canvas = innerDoc.querySelector("#unity-container");

        // Use a ResizeObserver to detect when Unity sets proper size
        const observer = new ResizeObserver(entries => {
            for (const entry of entries) {
                const height = entry.contentRect.height;
                const width = entry.contentRect.width;

                if (height > 0) {
                    iframe.style.height = height + "px";
                    doneLoading(innerDoc);
                    console.log("Auto-resized iframe to:", width, height);
                    observer.disconnect(); // Done observing
                }
            }
        });

        observer.observe(canvas);
    } catch (err) {
        console.error("Failed to access iframe content:", err);
    }
});
