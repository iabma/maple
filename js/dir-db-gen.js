const blacklist = [".git", ".DS_Store"]

function getLast(dir) {
    return dir.substring(dir.lastIndexOf('/') + 1);
}

function makeHash() {
    var hash = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";

    for (var i = 0; i < 15; i++) {
        hash += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return hash;
}

var directoryTreeToObj = async (dir, done) => {
    var results = [];

    await fs.readdir(dir, (err, list) => {
        if (err) return done(err);

        var pending = list.length;

        if (!pending) return done(null, { name: path.basename(dir), children: results });

        list.forEach((file) => {
            file = path.resolve(dir, file);
            fs.stat(file, (err, stat) => {
                if (!blacklist.includes(path.basename(file))) {
                    if (stat && stat.isDirectory()) {
                        directoryTreeToObj(file, async (err, res) => {
                            if (err) return done(err);

                            await getSize(file, (err, size) => {
                                if (err) return done(err);

                                results.push({
                                    hash: makeHash(),
                                    name: path.basename(file),
                                    type: "folder",
                                    size: size,
                                    path: file,
                                    children: res
                                });

                                //console.log(pending - 1)
                                if (!--pending)
                                    done(null, results)
                            });
                        });
                    } else {
                        results.push({
                            hash: makeHash(),
                            name: path.basename(file),
                            type: "file",
                            size: stat.size,
                            path: file,
                        });
                        if (!--pending) done(null, results);
                    }
                } else {
                    pending--;
                }
            });
        });
    });
    done(null, results)
};

let currentMainHash,
    writeComplete = false;

directoryTreeToObj(mainDir, async (err, data) => {
    console.log("data")
    if (err)
        console.error(err);

    currentMainHash = makeHash();

    await getSize(mainDir, (err, size) => {
        if (err) console.error(err);

        let dirJSON = {
            hash: currentMainHash,
            name: path.basename(mainDir),
            type: "folder",
            size: size,
            path: mainDir,
            children: data
        };

        fs.writeFile(path.resolve(__dirname, "../js/dir.json"), JSON.stringify(dirJSON), (err) => {
            if (err) console.error(err);

            writeComplete = true;
            console.log("'dir.json' written.")
        })
    });
});