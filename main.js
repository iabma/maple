console.log("running main");

const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("path");
const url = require("url");
const fs = require("fs");

const operatingSystems = {
    "darwin": "macOS",
    "win32": "Windows",
    "linux": "Linux",
    "freebsd": "FreeBSD",
    "sunos": "SunOS"
};
const plat = operatingSystems[process.platform]; // ! unused

let main, start;

require('child_process').exec('git rev-parse HEAD', function(err, stdout) {
    console.log('Last commit hash on this branch is:', stdout);
});

function createStartWindow() {
    start = new BrowserWindow({
        transparent: true,
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

    start.on("close", () => {
        start = null;
    });
}

function createMainWindow() {
    main = new BrowserWindow({
        hasShadow: false,
        frame: false
    });

    main.loadURL(url.format({
        pathname: path.join(__dirname, "./html/index.html"),
        protocol: "file",
        slashes: true
    }));

    main.on("close", () => {
        main = null;
    });
}

function switchToMain() {
    createMainWindow();
    start.close();
}

function fadeStart() {
    let increment = 0.05;
    let o = start.getOpacity();
    let loop = setTimeout(fadeStart, 1);

    if (o < 0) {
        clearTimeout(loop);
    } else {
        start.setOpacity(o - increment);
    }
    console.log(o);
}

ipcMain.on("openDir", (event) => {
    let dir = dialog.showOpenDialog(start, { properties: ['openDirectory'] });
    if (!dir) { 
        console.log("No selected directory.");
        return; 
    }

    console.log(dir[0]);

    fadeStart();
    setTimeout(switchToMain, 500);
})

ipcMain.on("openFile", (event) => {
    dialog.showOpenDialog(start, (fileNames) => {
        if (fileNames === undefined) { console.log("No selected files."); return; }

        fs.readFile(fileNames[0], "utf-8", (err, data) => {
            if (err) { console.log("Error: " + err); return; }

            event.returnValue = data;
        });
    })
}); // ! unused
  
app.on("ready", createStartWindow);

app.on("window-all-closed", () => {
    app.quit();
});

app.on("activate", () => {
    if (start === null && main == null) {
        createStartWindow();
    }
});