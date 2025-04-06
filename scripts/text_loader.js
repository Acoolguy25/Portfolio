window.addEventListener('load', function() {
    const customTexts = document.getElementsByClassName("loading_text")
    for (let textLabel of customTexts){
        textLabel.textContent = "loading..."
        fetch(`/lang/en-us/${textLabel.getAttribute("lang")}.txt`).then((responseVal) => {
            responseVal.text().then((newText) => {
                textLabel.innerHTML = newText.replaceAll("\n", "<br></br>")
            })
        })
    }
})