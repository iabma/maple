let currentRootHash,
    width = document.getElementById("container").width.baseVal.value,
    height = width;

const pack = d3.pack()
    .size([width - 4, width - 4])
    .padding(3);

function getLayer(dir) {
    dir.children.forEach(child => {
        if (child.children) child.children = [];
    });
}

function searchTree(parent, tree, hash){
    if (tree.hash == hash) {
         return [parent, tree];
    } else if (tree.children != null) {
         var i;
         var result = null;

         for (i = 0; result == null && i < tree.children.length; i++){
                result = searchTree(tree, tree.children[i], hash);
         }

         return result;
    }

    return null;
}

function addFrom(g, data, version) {
    let root = d3.hierarchy(data)
            .sum(d => Math.log(d.size))
            .sort((a,b) => b.value - a.value);

    console.log(root);

    let circle = g
        .selectAll("circle")
        .data(pack(root).descendants());
    let v = [root.x, root.y, root.r * 2.1];
    let k = width / v[2];

    circle.exit().remove();

    circle.enter().append("circle")
    .attr("id", d => d.data.hash )
    .merge(circle)
    .attr("fill", findColor)
    .attr("stroke", findColor)
    .on("mousemove", showInfo)
    .on("mouseout", hideInfo)
    .transition()
        .attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`)
        .attr("r", d => d.r * k)
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
    //createVisual(null, tree);

    var index = versions.length;
    let iteration = setInterval(() => {
        index--;

        addFrom(g, tree);
        //createVisual(null, tree);

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
    
            timeline(tree, commits);
        });
    }
}

function showInfo(node, m) {
    let mousePos = d3.mouse(this);
    d3.select("#tooltip")
        .style("left", node.x)
        .style("top", node.y)
        .text(node.data.name);
    d3.select("#directory")
        .text(node.data.name);
}

function hideInfo(node, m) {
    let mousePos = d3.mouse(this);
    d3.select("#tooltip")
        .style("left", mousePos[0])
        .style("top", mousePos[1])
        .text("");
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

function expand(node) {

}

async function createVisual(parent, input) {
    currentRootHash = input.hash;

    d3.json(path.resolve(__dirname, "../js/dir.json"), async (err, tree) => {
        if (err) console.error(err);

        document.getElementById("container").innerHTML = null;

        getLayer(input); // * SUPER IMPORTANT: Uncommented - expanded, Commented - collapsed

        root = d3.hierarchy(input)
            .sum(d => Math.log(d.size))
            .sort((a,b) => b.value - a.value);

        let focus = root,
            packed = pack(root),
            nodes = packed.descendants();

        const svg = d3.select("#container")
            .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
            .on("click", () => {
                if (document.getElementById("directory").innerHTML === "") createVisual(null, tree);
            })

        const threshhold = 25;
        var amt = 0;

        const node = svg.append("g")
            .attr("id", "gsvg")
            .selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .attr("id", d => d.data.hash )
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
                            let info = searchTree(tree, tree, d.data.hash);
                            createVisual(info[0], info[1]);
                        } else {
                            if (d.parent.parent) {
                                createVisual(d.parent.parent.data, d.parent.data);
                            } else if (d.parent.data.hash !== currentRootHash) {
                                createVisual(null, d.parent.data);
                            }
                        }
                    } else if (direction === "down" && currentRootHash !== currentMainHash) {
                        let info = searchTree(null, tree, parent.hash);
                        createVisual(info[0], info[1]);
                    }
                }
            })
            .on("click", d => { 
                if (focus !== d) { 
                    zoom(d); 
                    d3.event.stopPropagation();
                } else {
                    zoom(root);
                }
            })
            .on("contextmenu", d => { 
                addFrom(tree);
            })
            .on("mousemove", showInfo)
            .on("mouseout", hideInfo)


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