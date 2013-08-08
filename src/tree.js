function Tree(div, assets) {
    this.div = div;
    this.paper = null;
    this.assets = assets;
    this.width = 0;
    this.height = 0;

    this.xScale = 0;
    this.yScale = 20;

    this.color = "#000000";
    this.highlightColor = "#aaaaaa";
    this.selectColor = "#000000";
}

//sets xScale based on distance of nodes
Tree.prototype.setXScale = function() {
    //get array of nodes
    var nodes = new Array();
    nodes.push(this.assets.root);
    for (var n = 0; n < nodes.length; n++) {
        var length = nodes[n].children.length;
        for (var m = 0; m < length; m++) {
            nodes.push(nodes[n].children[m]);
        }
    }

    //sort nodes by distance
    nodes.sort(Sort.compareNodeByDistance);

    //find average distance of nodes whose distance is more than 10% of the longest distance
    var length = nodes.length;
    var sum = 0;
    for (var start = 0; nodes[start].distance < nodes[length - 1].distance * 0.1; start++);
    for (n = start; n < length; n++) {
        sum += nodes[n].distance;
    }
    this.xScale = 80 / (sum / (length - start));
};

//draws a node of the tree, used by draw, do not use elsewhere
Tree.prototype.drawNode = function(node, x, y) {
    var width = 0, height = 0;

    //get x for this node
    x += node.distance * this.xScale;
    node.x = x;

    //internode
    if (node.children.length > 0) {
        //recursively draw nodes
        var length = node.children.length;
        for (var n = 0; n < length; n++) {
            y = this.drawNode(node.children[n], x, y);
        }

        //draw self
        node.y = (node.children[0].y + node.children[length - 1].y) * 0.5;
        node.raphNode = this.paper.path(
            "M " + node.x + " " + node.children[0].y +
            " l 0 " + (node.children[length - 1].y - node.children[0].y)
        ).attr({stroke: this.color, "stroke-width": 2});
        node.raphNodeWrapper = this.paper.path(
            "M " + node.x + " " + node.children[0].y +
            " l 0 " + (node.children[length - 1].y - node.children[0].y)
        ).attr({stroke: "transparent", "stroke-width": 12});

        if (node.isolates.length == 0) {
            if (node.x + 8 > width) {
                width = node.x + 8;
            }
            if (node.y + 8 > height) {
                height = node.y + 8;
            }
        }

        //attach node to Raphael object
        node.raphNode.source = node;
        node.raphNodeWrapper.source = node;

        //event handlers
        node.raphNodeWrapper.click(this.onClick_node);
        node.raphNodeWrapper.mouseover(this.onMouseOver_node);
        node.raphNodeWrapper.mouseout(this.onMouseOut_node);
    }

    //leaf
    else {
        var x0 = node.x + 12;
        var y0 = y;
        var _x = x0;

        //isolates
        var length = node.isolates.length;
        for (var n = 0; n < length; n++) {
            //draw isolate
            node.isolates[n].raphTreeLabel = this.paper.text(_x, y, node.isolates[n].name)
                .attr({fill: node.isolates[n].color, "font-size": 12, "text-anchor": "start"});

            //attach isolate to Raphael object
            node.isolates[n].raphTreeLabel.source = node.isolates[n];

            //event handlers
            node.isolates[n].raphTreeLabel.click(this.onClick_isolate);
            node.isolates[n].raphTreeLabel.mouseover(this.onMouseOver_isolate);
            node.isolates[n].raphTreeLabel.mouseout(this.onMouseOut_isolate);

            //isolate position
            var boxWidth = 0.64 * 12 * node.isolates[n].name.length;
            if ((_x + boxWidth - x0) > 300) {
                if (_x + boxWidth > width) {
                    width = _x + boxWidth;
                }
                _x = x0;
                y += this.yScale * 0.75
            }
            node.isolates[n].raphTreeLabel.attr({x: _x, y: y});
            _x += boxWidth + 6;
        }

        if (_x > width) {
            width = _x;
        }
        if (y > height) {
            height = y;
        }

        //draw leaf
        node.y = (y0 + y) * 0.5;
        node.raphNode = this.paper.circle(node.x, node.y, 4)
            .attr({stroke: this.color, fill: this.color});

        //attach node to Raphael object
        node.raphNode.source = node;

        //event handlers
        node.raphNode.click(this.onClick_node);
        node.raphNode.mouseover(this.onMouseOver_node);
        node.raphNode.mouseout(this.onMouseOut_node);

        y += this.yScale;
    }

    //draw branch
    node.raphBranch = this.paper.path(
        "M " + node.x + " " + node.y +
        " l -" + (node.distance * this.xScale) + " 0"
    ).attr({stroke: this.color, "stroke-width": 2}).toBack();
    node.raphBranch.source = node;

    //adjust paper size
    if (width > this.width) {
        this.width = width;
    }
    if (height > this.height) {
        this.height = height;
    }

    return y;
};

//draws the tree stored in assets
Tree.prototype.draw = function() {
    this.paper = Raphael(this.div, 1, 1);
    this.paper.source = this;

    //draw tree
    this.setXScale();
    this.drawNode(this.assets.root, 10, 10);

    //set paper size
    this.width += 10;
    this.height += 10;
    this.paper.setSize(this.width, this.height);
};

//disposes the tree from the div container
Tree.prototype.dispose = function() {
    this.width = 0;
    this.height = 0;
    this.xScale = 0;

    if (this.paper) {
        this.paper.clear();
        this.paper.remove();
    }
    $("#" + this.div).html("");
};

Tree.prototype.highlightNode = function(node, flag) {
    if (flag) {     //highlight
        if (node.uiState == 0) {
            node.uiState = 1;
            var bBox = node.raphNode.getBBox();
            node.raphNodeBBox = this.paper.rect(
                bBox.x - 2, bBox.y - 2, bBox.width + 4, bBox.height + 4
            ).attr({stroke: this.highlightColor}).toBack();
        }
    }
    else {      //dehighlight
        if (node.uiState == 1) {
            node.uiState = 0;
            node.removeRaphNodeBBox();
            node.removeRaphBranchBBox();
        }
    }

    var length = node.children.length;
    for (var n = 0; n < length; n++) {
        if (flag) {
            if (!node.children[n].raphBranchBBox) {
                bBox = node.children[n].raphBranch.getBBox();
                node.children[n].raphBranchBBox = this.paper.rect(
                    bBox.x - 2, bBox.y - 2, bBox.width + 4, bBox.height + 4
                ).attr({stroke: this.highlightColor}).toBack();
            }
        }
        else if (node.uiState == 0) {
            if (node.children[n].raphBranchBBox) {
                node.children[n].removeRaphBranchBBox();
            }
        }
        this.highlightNode(node.children[n], flag);
    }

    length = node.isolates.length;
    for (n = 0; n < length; n++) {
        this.highlightIsolate(node.isolates[n], flag);
    }
};

Tree.prototype.selectNode = function(node, flag, isRecursive) {
    if (flag) {     //select
        if (node.uiState == 0) {
            node.uiState = 2;
            var bBox = node.raphNode.getBBox();
            node.raphNodeBBox = this.paper.rect(
                bBox.x - 2, bBox.y - 2, bBox.width + 4, bBox.height + 4
            ).attr({stroke: this.selectColor}).toBack();
        }
    }
    else {      //deselect
        if (node.uiState == 2) {
            node.uiState = 0;
            node.removeRaphNodeBBox();
            node.removeRaphBranchBBox();
        }
    }

    if (isRecursive) {
        var length = node.children.length;
        for (var n = 0; n < length; n++) {
            if (flag) {
                if (!node.children[n].raphBranchBBox) {
                    var bBox = node.children[n].raphBranch.getBBox();
                    node.children[n].raphBranchBBox = this.paper.rect(
                        bBox.x - 2, bBox.y - 2, bBox.width + 4, bBox.height + 4
                    ).attr({stroke: this.selectColor}).toBack();
                }
            }
            else if (node.uiState == 0) {
                if (node.children[n].raphBranchBBox) {
                    node.children[n].removeRaphBranchBBox();
                }
            }
            this.selectNode(node.children[n], flag, true);
        }

        length = node.isolates.length;
        for (n = 0; n < length; n++) {
            this.selectIsolate(node.isolates[n], flag);
        }
    }
};

Tree.prototype.highlightIsolate = function(isolate, flag) {
    if (flag) {     //highlight
        if (isolate.uiState == 0) {
            isolate.uiState = 1;
            var bBox = isolate.raphTreeLabel.getBBox();
            isolate.raphTreeBBox = this.paper.rect(
                bBox.x - 2, bBox.y, bBox.width + 4, bBox.height
            ).attr({stroke: this.highlightColor}).toBack();

            bBox = isolate.raphListLabel.getBBox();
            isolate.raphListBBox = this.assets.isolateList.paper.rect(
                bBox.x - 2, bBox.y, bBox.width + 4, bBox.height
            ).attr({stroke: this.assets.isolateList.highlightColor}).toBack();
        }
    }
    else {      //dehighlight
        if (isolate.uiState == 1) {
            isolate.uiState = 0;
            isolate.removeRaphTreeBBox();
            isolate.removeRaphListBBox();
        }
    }
};

Tree.prototype.selectIsolate = function(isolate, flag) {
    if (flag) {     //select
        if (isolate.uiState == 0) {
            isolate.uiState = 2;
            var bBox = isolate.raphTreeLabel.getBBox();
            isolate.raphTreeBBox = this.paper.rect(
                bBox.x - 2, bBox.y, bBox.width + 4, bBox.height
            ).attr({stroke: this.selectColor}).toBack();
            this.assets.selectedIsolates.push(isolate);

            bBox = isolate.raphListLabel.getBBox();
            isolate.raphListBBox = this.assets.isolateList.paper.rect(
                bBox.x - 2, bBox.y, bBox.width + 4, bBox.height
            ).attr({stroke: this.assets.isolateList.selectColor}).toBack();
        }
    }
    else {      //deselect
        if (isolate.uiState == 2) {
            isolate.uiState = 0;
            isolate.removeRaphTreeBBox();
            isolate.removeRaphListBBox();
            this.assets.selectedIsolates.remove(isolate);
        }
    }
};

Tree.prototype.updateNodeSelect = function(node) {
    var select = true;

    var length = node.children.length;
    for (var n = 0; n < length; n++) {
        if (!this.updateNodeSelect(node.children[n])){
            select = false;
            break;
        }
    }

    length = node.isolates.length;
    for (n = 0; n < length; n++) {
        if (node.isolates[n].uiState == 0) {
            select = false;
            break;
        }
    }

    if (!select) {
        this.selectNode(node, false, false);
        length = node.children.length;
        for (n = 0; n < length; n++) {
            if (node.children[n].uiState == 2) {
                node.children[n].removeRaphBranchBBox();
            }
        }
    }

    return select;
};

Tree.prototype.onClick_node = function(event) {
    var node = this.source;
    var tree = this.paper.source;
    if (node.uiState == 0) {    //normal
        tree.selectNode(node, true, true);
    }
    else if (node.uiState == 1) {   //highlighted
        tree.highlightNode(node, false);
        tree.selectNode(node, true, true);
    }
    else if (node.uiState == 2) {   //selected
        tree.selectNode(node, false, true);
        //deselect parent nodes
        while (node.parent && node.parent.uiState == 2) {
            node = node.parent;
        }
        tree.updateNodeSelect(node);
    }
};

Tree.prototype.onMouseOver_node = function(event) {
    var node = this.source;
    var tree = this.paper.source;
    if (node.uiState == 0) {    //normal
        tree.highlightNode(node, true);
    }
};

Tree.prototype.onMouseOut_node = function(event) {
    var node = this.source;
    var tree = this.paper.source;
    if (node.uiState == 1) {    //highlighted
        tree.highlightNode(node, false);
    }
};

Tree.prototype.onClick_isolate = function(event) {
    var isolate = this.source;
    var tree = this.paper.source;
    if (isolate.uiState == 0) {    //normal
        tree.selectIsolate(isolate, true);
    }
    else if (isolate.uiState == 1) {   //highlighted
        tree.highlightIsolate(isolate, false);
        tree.selectIsolate(isolate, true);
    }
    else if (isolate.uiState == 2) {   //selected
        tree.selectIsolate(isolate, false);
        //deselect parent nodes
        var node = isolate.node;
        while (node.parent && node.parent.uiState == 2) {
            node = node.parent;
        }
        tree.updateNodeSelect(node);
    }
};

Tree.prototype.onMouseOver_isolate = function(event) {
    var isolate = this.source;
    var tree = this.paper.source;
    if (isolate.uiState == 0) {    //normal
        tree.highlightIsolate(isolate, true);
    }
};

Tree.prototype.onMouseOut_isolate = function(event) {
    var isolate = this.source;
    var tree = this.paper.source;
    if (isolate.uiState == 1) {    //highlighted
        tree.highlightIsolate(isolate, false);
    }
};