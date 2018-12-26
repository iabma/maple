var orderedHashes = [],
    commits = [],
    logs,
    parseComplete = false;

async function getLogs() {
    await git.log(["--pretty=oneline"], (err, out) => {
        if (err) {
            console.log("Error: " + err);
            return;
        }

        logs = out.latest.hash.split("\n")
        parseLogs(logs)
    });
}

async function parseLogs(logs) {
    let numCommits = logs.length;

    await logs.forEach(commit => {
        var hash = commit.split(" ")[0];

        orderedHashes.unshift(hash);
        git.show(["--name-only", "--pretty=email", hash], (err, out) => {
            if (err) console.error(err);

            let lines = out.split("\n");

            var startFound = false;
            var line = 0;
            var startLine = -1;
            do {
                if (fs.existsSync(mainDir + lines[line])) {
                    startFound = true;
                    startLine = line;
                } else {
                    line++;
                }
            } while (!startFound);

            var commit = {
                hash: hash,
                authorInfo: lines[1].substring(6),
                date: lines[2].substring(6),
                subject: lines[3].substring(9),
                files: lines.slice(startLine)
            };

            commits[orderedHashes.indexOf(hash)] = commit;
            if (Object.keys(commits).length === numCommits) {
                parseComplete = true;
            }
        });
    });
}

getLogs();