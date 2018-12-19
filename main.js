console.log("running main");

const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const url = require("url");

let main;

function createWindow() {
    main = new BrowserWindow({
        transparent: true,
        titleBarStyle: "hidden"
    });

    main.loadURL(url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file",
        slashes: true
    }));

    //main.webContents.openDevTools();
    main.on("close", () => {
        main = null
    });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (main === null) {
        createWindow();
    }
});