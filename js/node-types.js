function getPath(rel) {
    return path.resolve(__dirname, rel)
}

const visual = "#b75ef2";

const nodeTypes = {
    folder: {
        color: d3.scaleLinear()
        .domain([0, 5])
        .range(["rgb(26, 24, 24)", "rgb(160, 150, 150)"])
        .interpolate(d3.interpolateHcl)
    },
    file: {
        js: {
            color: "#f9a91d"
        },
        json: {
            color: "#f9a91d"
        },
        css: {
            color: "#38abff"
        },
        html: {
            color: "#ff4137"
        },
        htm: {
            color: "#ff4137"
        },
        java: {
            color: "#ff4137"
        },
        class: {
            color: "#ff4137"
        },
        ru: {
            color: "#ff4137"
        },
        less: {
            color: "#38abff"
        },
        xml: {
            color: "#ace858"
        },
        iml: {
            color: "#ace858"
        },
        plist: {
            color: "#ace858"
        },
        zip: {
            color: "#db53db"
        },
        gz: {
            color: "#db53db"
        },
        h: {
            color: "#0b9cef"
        },
        tex: {
            color: "#e0be45"
        },
        aux: {
            color: "#e0be45"
        },
        c: {
            color: "#0b9cef"
        },
        m: {
            color: "#0b9cef"
        },
        png: {
            color: visual
        },
        svg: {
            color: visual
        },
        ico: {
            color: visual
        },
        icns: {
            color: visual
        },
        bmp: {
            color: visual
        },
        gvdesign: {
            color: visual
        },
        psd: {
            color: visual
        },
        jpg: {
            color: visual
        },
        jpeg: {
            color: visual
        },
        sig: {
            color: visual
        },
        tiff: {
            color: visual
        },
        pdf: {
            color: visual
        },
        php: {
            color: "#255bc6"
        }
    }
}