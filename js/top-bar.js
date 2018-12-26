let currentWindow = remote.getCurrentWindow();

if (!currentWindow.isMaximized()) {
    document.getElementById("expand").data = "../img/expand.svg";
} else {
    document.getElementById("expand").data = "../img/collapse.svg";
}

window.addEventListener("message", function(msg) {
    if (msg.data == "closewindow") {
        remote.getCurrentWindow().close();
    } else if (msg.data == "minimizewindow") {
        remote.getCurrentWindow().minimize();
    } else if (msg.data == "expandwindow") {
        remote.getCurrentWindow().setFullScreen(!remote.getCurrentWindow().isFullScreen());
        document.getElementById("expand").data = "../img/collapse.svg";
    } else if (msg.data == "collapsewindow") {
        remote.getCurrentWindow().setFullScreen(!remote.getCurrentWindow().isFullScreen());
        document.getElementById("expand").data = "../img/expand.svg";
    }
});