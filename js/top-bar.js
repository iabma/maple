let currentWindow = remote.getCurrentWindow();
const time = document.getElementById("time"),
    wifi = document.getElementById("wifi"),
    battIcon = document.getElementById("battery");

if (!currentWindow.isMaximized()) {
    document.getElementById("expand").data = "../img/expand.svg";
} else {
    document.getElementById("expand").data = "../img/collapse.svg";
}

window.addEventListener("message", function (msg) {
    if (msg.data == "closewindow") {
        remote.getCurrentWindow().close();
    } else if (msg.data == "minimizewindow") {
        remote.getCurrentWindow().minimize();
    } else if (msg.data == "expandwindow") {
        remote.getCurrentWindow().setFullScreen(true);
        document.getElementById("expand").data = "../img/collapse.svg";
        stats(true);
    } else if (msg.data == "collapsewindow") {
        stats(false);
        remote.getCurrentWindow().setFullScreen(false);
        document.getElementById("expand").data = "../img/expand.svg";
    }
});

function stats(b) {
    if (b) {
        time.style.visibility = "visible";
        wifi.style.visibility = "visible";
        battIcon.style.visibility = "visible";
    } else {
        time.style.visibility = "hidden";
        wifi.style.visibility = "hidden";
        battIcon.style.visibility = "hidden";
    }
}

let perc = "pmset -g batt | grep -o '[0-9]*%' && pmset -g batt | grep -F 'charg' | awk '{ print $4 }'";
let RSSI = "/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I | grep CtlRSSI";

setInterval(() => {
    time.innerHTML = moment().format("LTS");
    cmd.exec(perc, (err, stdout) => {
        if (err)
            console.error(err);
        let output = stdout.split("\n"),
            p = Math.round(Number(output[0].substring(0, output[0].length - 1))),
            status = output[1].substring(0, output[1].length - 1);
        var label = "battery"
        if (isCharging(status))
            label += "_charging";
        if (p == 100) {
            label += "_full";
        } else if (p >= 90) {
            label += "_90";
        } else if (p >= 80) {
            label += "_80";
        } else if (p >= 60) {
            label += "_60";
        } else if (p >= 50) {
            label += "_50";
        } else if (p >= 30) {
            label += "_30";
        } else if (p >= 20) {
            label += "_20";
        } else {
            label += "_alert";
        }
        battIcon.innerHTML = label;
    });
    cmd.exec(RSSI, (err, stdout) => {
        if (err)
            console.error(err);
        let quality = Math.round((Number(stdout.substring(17)) + 100) / 10) - 1;
        if (quality < 0) quality = 0;
            wifi.innerHTML = "signal_wifi_" + quality + "_bar";
    });
}, 1000);

function isCharging(status) {
    if (status == "charging" || status == "charged")
        return true;
    return false;
}