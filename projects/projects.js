fetch("https://api.github.com/users/acoolguy25/repos").then(data => data.json()).then((data) => {
    console.log(data)

})