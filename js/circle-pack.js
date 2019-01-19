let currentRootHash,
    currentSelectedNode,
    width = document.getElementById("container").width.baseVal.value,
    height = width,
    layered = false;

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

    return dir;
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

            if (layered) getLayer(tree); // * SUPER IMPORTANT: Uncommented - expanded, Commented - collapsed

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

async function updateInfo(tree, node) {
    document.getElementById("stats").getElementsByClassName("text")[0].innerHTML =
        "INFO<br>name - " + node.data.name + "<br>kind - " + node.data.type + "<br>size - " + formatSize(node.data.size);

    d3.select("#specialized").html("");
    if (node.data.type == "file") {
        await fs.readFile(node.data.path, (err, data) => {
            if (err) console.error(err);

            d3.select("#specialized")
                .append("textarea")
                .html(data.toString());
        })
    } else if (node.data.type == "folder") {
        let tempNode = searchTree(tree, node.data.hash);

        var item = d3.select("#specialized")
            .selectAll("div")
            .data(tempNode.children)
            .enter()
            .append("div");

        item.attr("class", "child");
            
        /*item.append("i")
            .attr("class", "material-icons circle")
            .html("folder")*/
        item.append("svg")
            .append("circle")
            .attr("viewbox", "-50 -50 100 100");

        item.append("p")
            .html(d => d.name + "<br>" + formatSize(d.size));
    }
}

function expand(tree, root, node) {
    searchTree(root, node.data.hash).children = searchTree(tree, node.data.hash).children;

    if (layered) getLayer(searchTree(root, node.data.hash)); // * SUPER IMPORTANT: Uncommented - expanded, Commented - collapsed

    createVisual(root);
}

function collapse(root, node) {
    searchTree(root, node.data.hash).children = [];

    createVisual(root);
}

async function createVisual(input) {
    currentRootHash = input.hash;

    d3.json(path.resolve(__dirname, "../js/dir.json"), async (err, tree) => {
        if (err) console.error(err);

        //document.getElementById("container").innerHTML = null;

        root = d3.hierarchy(input)
            .sum(d => Math.log(d.size))
            .sort((a, b) => b.value - a.value);

        updateInfo(tree, currentSelectedNode  || root);

        let focus = root,
            packed = pack(root),
            nodes = packed.descendants();

        const svg = d3.select("#container")
            .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
            .on("click", () => {
                if (document.getElementById("directory").innerHTML === searchTree(tree, currentRootHash).path.split("/").join(" > ")) {
                    if (layered) getLayer(info); // * SUPER IMPORTANT: Uncommented - expanded, Commented - collapsed
                    
                    createVisual(tree);
                }
            })

        const threshold = 25;
        var amt = 0;

        const node = d3.select("#gsvg")
            .selectAll("circle")
            .data(nodes)


        const circle = node.enter().append("circle");

        circle
            .attr("id", d => d.data.hash)
            //.attr("transform", d => `translate(${(d.x - root.x) * (width / (root.r * 2.1))},${(d.y - root.y) * width / (root.r * 2.1)})`)
            .merge(node)
            .on("wheel", d => {
                var direction = d3.event.wheelDelta < 0 ? "up" : "down";
                if (amt <= threshold) {
                    amt++;
                } else {
                    amt = 0;
                    if (direction === "up" && d.data.hash !== currentRootHash) {
                        if (d.data.type === "folder") {
                            let info = searchTree(tree, d.data.hash);

                            if (layered) getLayer(info); // * SUPER IMPORTANT: Uncommented - expanded, Commented - collapsed

                            createVisual(info);
                        } else if (d.parent) {

                            if (layered) getLayer(d.parent.data); // * SUPER IMPORTANT: Uncommented - expanded, Commented - collapsed

                            createVisual(d.parent.data);
                        }
                    } else if (direction === "down" && currentRootHash !== currentMainHash) {
                        let parent = findParent(tree, currentRootHash, null);
                        //console.log(parent);
                        let info = searchTree(tree, parent.hash);

                        if (layered) getLayer(info); // * SUPER IMPORTANT: Uncommented - expanded, Commented - collapsed
                        
                        createVisual(info);
                    }
                }
            })
            .on("click", d => {
                if (currentSelectedNode != d) {
                    currentSelectedNode = d;
                    updateInfo(tree, d);
                }
                if (focus !== d) {
                    zoom(d);
                    d3.event.stopPropagation();
                } else {
                    zoom(root);
                }
            })
            .on("contextmenu", d => {
                if (currentSelectedNode != d) {
                    currentSelectedNode = d;
                    updateInfo(tree, d);
                }
                if (d.children) {
                    collapse(input, d);
                } else if (d.data.type == "folder") {
                    expand(tree, input, d);
                }
            })
            .on("mousemove", (node) => updatePath(tree, node))
            .on("mouseout", hidePath)

        node.exit().remove();

        //console.log(root)
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
            circle
                .merge(node)
                .transition()
                .attr("fill", findColor)
                .attr("stroke", findColor)
                .attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`)
                .attr("r", d => d.r * k)
                .duration(100);
        }

        function zoom(d) {
            focus = d;

            zoomTo([focus.x, focus.y, focus.r * 2.1]);
        }
    });
}

waitForData();