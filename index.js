console.log("running index");
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const remote = require("electron").remote;

window.addEventListener("message", function(msg) {
    if (msg.data == "closewindow") {
        remote.getCurrentWindow().close();
    } else if (msg.data == "minimizewindow") {
        remote.getCurrentWindow().minimize();
    } else if (msg.data == "expandwindow") {
        let window = remote.getCurrentWindow();
        if (!window.isMaximized()) {
            window.maximize();
        } else {
            window.unmaximize();
        }
    }
})