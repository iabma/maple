console.log("running main");

const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const url = require("url");

const operatingSystems = {
    "darwin": "macOS",
    "win32": "Windows",
    "linux": "Linux",
    "freebsd": "FreeBSD",
    "sunos": "SunOS"
};
const plat = operatingSystems[process.platform];

let main, start;

function createWindow() {
    start = new BrowserWindow({
        opacity: 0,
        hasShadow: false,
        width: 550,
        height: 329,
        resizable: false,
        frame: false
    });

    start.loadURL(url.format({
        pathname: path.join(__dirname, "./html/start.html"),
        protocol: "file",
        slashes: true
    }));

    start.webContents.openDevTools();
    start.on("close", () => {
        start = null;
    });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
    if (plat !== "macOS") { // ? Do I want this if statement?
        app.quit();
    }
});

app.on("activate", () => {
    if (start === null) {
        createWindow();
    }
});