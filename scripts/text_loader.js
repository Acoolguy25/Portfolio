function daysUntilBirthday(birthYear, birthMonth, birthDay) {
    const today = new Date();
    const currentYear = today.getFullYear();

    // Create birthday date for this year (month is 0-based in JavaScript)
    let birthday = new Date(currentYear, birthMonth - 1, birthDay);
    age = currentYear - birthYear - 1
    // If birthday has passed this year, use next year
    if (today > birthday) {
        birthday = new Date(currentYear + 1, birthMonth - 1, birthDay);
        age += 1
    }

    // Calculate difference in milliseconds and convert to days
    const diffTime = birthday - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return [diffDays, age];
}
function replaceConstants(msg){
    const [daysLeft, age] = daysUntilBirthday(2005, 7, 12);
    msg = msg.replaceAll("<Age>", age).replaceAll("<DaysToBirthday>", daysLeft)
    return msg.replaceAll("\n", "<br>")
}
const customTexts = document.getElementsByClassName("loading_text")
for (let textLabel of customTexts){
    textLabel.textContent = "loading..."
    fetch(`/lang/en-us/${textLabel.getAttribute("lang")}.txt`).then((responseVal) => {
        responseVal.text().then((newText) => {
            textLabel.innerHTML = replaceConstants(newText)
        })
    })
}
// unused
// const customButtons = document.getElementsByClassName("pagelink")
// for (let button of customButtons){
//     button.textContent = "loading..."
//     fetch(`/lang/en-us/${button.getAttribute("lang")}.txt`).then((responseVal) => {
//         responseVal.text().then((newText) => {
//             button.innerHTML = newText.replaceAll("\n", "<br>")
//         })
//     })
// }