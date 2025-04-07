let urlData = new URL(window.location.href);
console.log(urlData.pathname);
let pathname = urlData.pathname;

if (pathname === "/") {
    pathname = "home";
} else {
    pathname = pathname.substring(1); // remove the leading slash
}

// Using jQuery to load the HTML into the element with id "content"
$("#content").load("htmls/" + pathname + '.html', function(response, status, xhr) {
    if (status === 'error') {
      console.error('Error loading content:', xhr.status, xhr.statusText);
    }
});

// Dynamically load and execute an external JavaScript file
fetch("scripts/text_loader.js")
    .then(res => res.text())
    .then(data => {
        const scr = document.createElement("script");
        scr.text = data;
        document.body.appendChild(scr);
    });
