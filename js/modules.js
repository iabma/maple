const path = require("path"),
    fs = require("fs"),
    getSize = require("get-folder-size"),
    { remote, ipcRenderer } = require("electron"),
    mainDir = ipcRenderer.sendSync("requestDir"),
    git = require("simple-git")(mainDir); // ! DEPRECATE
    //git = require("nodegit");