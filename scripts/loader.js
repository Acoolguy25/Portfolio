// Run scripts only after loaded
document.body.style.visibility = "none";
if (!document.loader){
    
    let urlData = new URL(window.location.href);
    let pathname = urlData.pathname.replaceAll("/index.html", "/");
    document.loader = 1;
    const isDemos = pathname.includes("demos");

    document.body.style.transition = "opacity 0.8s ease";
    document.body.style.visibility = "visible";
    document.body.style.opacity = "0";

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
    let pathName2Load = '';
    if (!isDemos){ // demos
        if (pathname == "/") {
            pathName2Load = "/demos/demos";
        }
        else {
            pathName2Load = "/index";
        }
    }
    else{ // not demos
        // if (pathname == "/demos/crazy-plates/"){
            // pathName2Load = "/demos/crazy-plates/game/game"
        // }
        // using iframe instead!
    }
    if (pathName2Load != ""){
        console.log("Loading " + pathName2Load + ".html")
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

