

if (!document.loader){
    let urlData = new URL(window.location.href);
    let pathname = urlData.pathname;
    document.loader = 1;
    
    let pathName2Load;
    if (pathname === "/") {
        pathName2Load = "/htmls/home";
    } else {
        pathName2Load = "/index";
    }
    
    $("#content").load(pathName2Load + '.html');
    
    $("#header").load('/htmls/header.html');
    
    let scr2Run = ["/scripts/text_loader"]
    if (pathname != "/"){
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
    
}

