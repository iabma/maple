require('child_process').exec('git log -1 --format="%aD"', function(err, stdout) {
    let current = new Date(stdout);
    console.log("ver" + current.getDate() + "." + (current.getMonth() + 1) + "." + (current.getFullYear() - 2000));
    document.getElementById("version").innerHTML = "ver" + current.getDate() + "." + (current.getMonth() + 1) + "." + (current.getFullYear() - 2000);
});