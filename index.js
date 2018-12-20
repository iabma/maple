console.log("running index");

const clicker = document.getElementsByClassName("#logo");

clicker.addEventListener("click", function() {
    this.classList.toggle("clickit");
});