// Run scripts only after loaded
document.body.style.visibility = "none";
if (!document.loader){
    let urlData = new URL(window.location.href);
    let pathname = urlData.pathname.replaceAll("/index.html", "/");
    document.loader = 1;
    const isDemos = pathname.includes("demos");

    function loaded(){
        let scr2Run = ["/scripts/text_loader"]
        if (pathname != "/" && !isDemos){
            scr2Run.push([pathname + pathname.replaceAll("/", "")])
        }
        for (sc of scr2Run){
            fetch(sc + ".js")
                .then(res => res.text())
                .then(data => {
                    const scr = document.createElement("script");
                    scr.text = data;
                    document.body.appendChild(scr);
                });
        }

        requestAnimationFrame(() => {
            document.body.style.transition = "opacity 0.8s ease";
            document.body.style.visibility = "visible";
            document.body.style.opacity = "1";
        });

        // document.body.style.visibility = "visible";
        // document.body.style.opacity = "1";
    }
    if (!isDemos){
        let pathName2Load;
        if (pathname == "/") {
            pathName2Load = "/demos/demos";
        } else {
            pathName2Load = "/index";
        }
        $("#content").load(pathName2Load + '.html');
    }
    
    $("#header").load('/htmls/header.html');
    
    
    if (document.readyState == "complete"){
        loaded()
    }
    else{
        window.addEventListener('load', loaded)
    }
}

