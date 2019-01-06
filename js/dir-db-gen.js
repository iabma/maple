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

var directoryTreeToObj = (dir, done) => {
    var results = [];

    fs.readdir(dir, (err, list) => {
        if (err) return done(err);

        var pending = list.length;

        if (!pending) return done(null, {name: path.basename(dir), children: results});

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

                                    if (!--pending) done(null, results);
                                });
                            });
                    }
                    else {
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
};

let currentMainHash, 
    writeComplete = false;

directoryTreeToObj(mainDir, async (err, data) => {
    if(err) console.error(err);

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


/* 
var dict = "id,parentId,size\n" + getLast(mainDir) + "\n";

var directoryTreeToCSV = (dir, done) => {
    fs.readdir(dir, function(err, list) {
        if (err) return done(err);

        var pending = list.length;

        if (!pending) {
            dict += path.basename(dir) + "," + getLast(dir) + "\n";
            return done(null, dict);
        }

        list.forEach(function(file) {
            file = path.resolve(dir, file);
            fs.stat(file, function(err, stat) {
                if (err) return done(err);

                if (stat && stat.isDirectory()) {
                    if (path.basename(file) != ".git") {
                        directoryTreeToCSV(file, function(err) {
                            if (err) return done(err);
    
                            dict += path.basename(file) + "," + getLast(dir) + "\n";
                            if (!--pending) {
                                done(null, dict);
                            }
                        });
                    } else {
                        console.log(path.basename(file))
                    }
                }
                else {
                    dict += path.basename(file) + "," + getLast(dir) + "," + (stat.size / 100) + "\n";
                    if (!--pending) {
                        done(null, dict);
                    }
                }
            });
        });
    });
};

console.log()

directoryTreeToCSV(mainDir, (err, data) => {
    if(err) console.error(err);

    console.log("hi")
    fs.writeFile(path.resolve(__dirname, "../js/data.csv"), data, (err) => {
        if (err) console.error(err);
    });
});
 */