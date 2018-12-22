const { ipcRenderer } = require("electron");

let openButton = document.getElementById("btn-open");
let highlight = document.getElementById("highlight");
let versionText = document.getElementById("version");

require('child_process').exec('git log -1 --format="%aD"', function(err, stdout) {
    let current = new Date(stdout);
    versionText.innerHTML = "v. " + current.getDate() + "." + (current.getMonth() + 1) + "." + (current.getFullYear() - 2000);
});

openButton.addEventListener("mouseenter", () => {
    highlight.classList.toggle("expand");
    openButton.classList.toggle("disappear");
});

openButton.addEventListener("mouseleave", () => {
    highlight.classList.toggle("expand");
    openButton.classList.toggle("disappear");
});

openButton.addEventListener("click", () => {
    ipcRenderer.send("openDir");
});