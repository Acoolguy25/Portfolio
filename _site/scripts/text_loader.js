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
    const customButtons = document.getElementsByClassName("pagelink")
    console.log(customButtons)
    for (let button of customButtons){
        button.textContent = "loading..."
        fetch(`/lang/en-us/${button.getAttribute("lang")}.txt`).then((responseVal) => {
            responseVal.text().then((newText) => {
                button.innerHTML = newText.replaceAll("\n", "<br></br>")
            })
        })
    }
})