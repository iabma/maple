require("../js/top-bar.js");

const { ipcRenderer } = require("electron"),
    fs = require("fs"),
    path = require("path"),
    cmd = require("child_process");

function getLogs() {
    let commits = fs.readFileSync(path.resolve(ipcRenderer.sendSync("requestDir"), "./.git/logs/HEAD")).toString(),
        logs = commits.split("\n");
    console.log(commits);
    logs.pop();
    return logs;
}

var commits = {},
    orderedHashes = [];

async function getCommitInfo(hash) {
    cmd.exec('git show --name-only ' + hash, (err, stdout) => {
        if (err) {
            console.log("Error: " + err);
            return;
        }

        let lines = stdout.split("\n");

        let info = [
            lines[1].substring(8),
            lines[2].substring(8),
        ]
    
        return info;
    });
}

async function parseLogs() {
    let data = await getLogs();
    data.forEach((commit) => {
        var hash = commit.substring(41, 81),
            fileNames;

        console.log(2);
        orderedHashes.push(hash);
        cmd.exec('git show --name-only --pretty="" ' + hash, async (err, stdout) => {
            console.log(2);
            if (err) {
                console.log("Error: " + err);
                return;
            }

            let lines = stdout.split("\n");

            let info = await getCommitInfo(hash);


            fileNames = lines.slice();
            commits[hash] = {
                authorInfo: info[0],
                date: info[1],
                files: fileNames
            };
        });
    });
}

async function displayCommits() {
    await parseLogs();
    console.log(commits);
    for (let i = 0; i < commits.length; i++) {
        document.getElementById("temp").innerHTML += commits[orderedHashes[i]];
    }
}

displayCommits();