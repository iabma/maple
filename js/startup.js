const { ipcRenderer } = require("electron"),
    cmd = require("child_process");

let openButton = document.getElementById("btn-open");
let highlight = document.getElementById("highlight");
let versionText = document.getElementById("version");

cmd.exec('git log -1 --format="%aD"', (err, stdout) => {
    if (err) {
        console.log("Error: " + err);
        return;
    }

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