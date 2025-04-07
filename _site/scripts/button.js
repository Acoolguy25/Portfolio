window.addEventListener('load', function() {
    const button = document.getElementById("DangerButton")
    
    button.addEventListener("click", (event) => {
      button.textContent = `Click count: ${event.detail}`;
    });
})
