let currentRootHash,
    width = document.getElementById("container").width.baseVal.value,
    height = width;

const pack = d3.pack()
    .size([width - 4, width - 4])
    .padding(3);

function formatSize(size) {
    if (size < 1000) {
        return size + " B";
    } else if (size < 1000000) {
        return (size / 1000).toFixed(2) + " kB";
    } else if (size < 1000000000) {
        return (size / 1000000).toFixed(2) + " MB";
    } else if (size < 1000000000) {
        return (size / 1000000000).toFixed(2) + " GB";
    }
}

function getLayer(dir) {
    dir.children.forEach(child => {
        if (child.children) child.children = [];
    });
}

function findParent(tree, hash, parent) {
    console.log("hi");
    if (tree.hash == hash) {
        return parent;
    } else if (tree.children != null) {
        console.log("hi: " + tree.name);
        var i;
        var result = null;

        for (i = 0; result == null && i < tree.children.length; i++) {
            result = findParent(tree.children[i], hash, tree);
        }

        return result;
    }

    return null;
}

function searchTree(tree, hash) {
    if (tree.hash == hash) {
        return tree;
    } else if (tree.children != null) {
        var i;
        var result = null;

        for (i = 0; result == null && i < tree.children.length; i++) {
            result = searchTree(tree.children[i], hash);
        }

        return result;
    }

    return null;
}

function addFrom(g, data, version) {
    let root = d3.hierarchy(data)
        .sum(d => Math.log(d.size))
        .sort((a, b) => b.value - a.value);

    console.log(root);

    let circle = g
        .selectAll("circle")
        .data(pack(root).descendants());
    let v = [root.x, root.y, root.r * 2.1];
    let k = width / v[2];

    circle.exit().remove();

    circle.enter().append("circle")
        .attr("id", d => d.data.hash)
        .attr("fill", "#fff")
        .attr("stroke", "#fff")
        .merge(circle)
        .on("mousemove", showInfo)
        .on("mouseout", hideInfo)
        .transition()
        .attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`)
        .attr("r", d => d.r * k)
        .attr("fill", findColor)
        .attr("stroke", findColor)
        .duration(1000);

    console.log(circle)
}

function timeline(tree, versions) {
    console.log(tree.children)
    console.log(versions[0])

    let g = d3.select("#container")
        .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
        .append("g")
        .attr("id", "#gsvg");
    //createVisual(tree);

    var index = versions.length;
    let iteration = setInterval(() => {
        index--;

        addFrom(g, tree);
        //createVisual(tree);

        if (index <= 0) {
            clearInterval(iteration);
        }
    }, 2000);
}

function waitForData() {
    if (!writeComplete || !parseComplete) {
        setTimeout(waitForData, 100);
    } else {
        d3.json(path.resolve(__dirname, "../js/dir.json"), async (err, tree) => {
            if (err) console.error(err);

            createVisual(tree);
            //timeline(tree, commits);
        });
    }
}

function updatePath(tree, node) {
    let path = node.data.path.split("/").join(" > ");
    d3.select("#directory")
        .text(path || tree.name);
}

function hidePath() {
    d3.select("#directory")
        .text("");
}

function findColor(d) {
    if (d.data.type === "folder") {
        return nodeTypes.folder.color(d.depth);
    } else {
        let extension = d.data.name.substring(d.data.name.lastIndexOf(".") + 1);

        if (nodeTypes.file[extension]) {
            return nodeTypes.file[extension].color;
        } else {
            return "#f9f9f9";
        }
    }
}

async function updateInfo(node) {
    document.getElementById("stats").getElementsByClassName("text")[0].innerHTML =
        "INFO<br>name - " + node.data.name + "<br>kind - " + node.data.type + "<br>size - " + formatSize(node.data.size);

    d3.select("#specialized").html("");
    if (node.data.type == "file") {
        await fs.readFile(node.data.path, (err, data) => {
            if (err) console.error(err);

            console.log(data.toString().split("\n").join("<br>"))

            d3.select("#specialized")
                .append("textarea")
                .html(data.toString());
        })
    }
}

/* function expand(node) {

} */

async function createVisual(input) {
    currentRootHash = input.hash;

    d3.json(path.resolve(__dirname, "../js/dir.json"), async (err, tree) => {
        if (err) console.error(err);

        document.getElementById("container").innerHTML = null;

        //getLayer(input); // * SUPER IMPORTANT: Uncommented - expanded, Commented - collapsed

        root = d3.hierarchy(input)
            .sum(d => Math.log(d.size))
            .sort((a, b) => b.value - a.value);

        updateInfo(root);

        let focus = root,
            packed = pack(root),
            nodes = packed.descendants();

        const svg = d3.select("#container")
            .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
            .on("click", () => {
                if (document.getElementById("directory").innerHTML === "") createVisual(tree);
            })

        const threshhold = 25;
        var amt = 0;

        const node = svg.append("g")
            .attr("id", "gsvg")
            .selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .attr("id", d => d.data.hash)
            .attr("fill", findColor)
            .attr("stroke", findColor)
            .attr('r', d => d.r)
            .on("wheel", d => {
                var direction = d3.event.wheelDelta < 0 ? "up" : "down";
                if (amt <= threshhold) {
                    amt++;
                } else {
                    amt = 0;
                    if (direction === "up" && d.data.hash !== currentRootHash) {
                        if (d.data.type === "folder") {
                            let info = searchTree(tree, d.data.hash);
                            createVisual(info);
                        } else if (d.parent) {
                            createVisual(d.parent.data);
                        }
                    } else if (direction === "down" && currentRootHash !== currentMainHash) {
                        let parent = findParent(tree, currentRootHash, null);
                        console.log(parent);
                        let info = searchTree(tree, parent.hash);
                        createVisual(info);
                    }
                }
            })
            .on("click", d => {
                if (focus !== d) {
                    updateInfo(d);
                    zoom(d);
                    d3.event.stopPropagation();
                } else {
                    zoom(root);
                }
            })
            .on("contextmenu", d => {
                console.log(d);
            })
            .on("mousemove", (node) => updatePath(tree, node))
            .on("mouseout", hidePath)


        console.log(root)
        /* const label = svg.append("g")
            .style("font-family", "10px sans-serif")
            .attr("pointer-events", "none")
            .attr("text-anchor", "middle")
            .selectAll("text")
            .data(descendants)
            .enter().append("text")
            .style("color", "white")
            .style("fill-opacity", d => d.parent === root ? 1 : 0)
            .style("display", d => d.parent === root ? "inline" : "none")
            .text(d => d.data.name); */

        zoomTo([root.x, root.y, root.r * 2.1]);

        function zoomTo(v) {
            const k = width / v[2];

            view = v;

            // label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
            node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
            node.attr("r", d => d.r * k);
        }

        function zoom(d) {
            focus = d;

            zoomTo([focus.x, focus.y, focus.r * 2.1]);
        }
    });
}

waitForData();