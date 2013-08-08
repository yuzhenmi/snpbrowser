function IsolateList(div, assets) {
    this.div = div;
    this.paper = null;
    this.assets = assets;
    this.width = 0;
    this.height = 0;

    this.highlightColor = "#aaaaaa";
    this.selectColor = "#000000";
}

//draws isolate list
IsolateList.prototype.draw = function() {
    this.paper = Raphael(this.div, 1, 1);
    this.paper.source = this;

    //sort isolates
    var isolates = this.assets.isolates;
    var sortIndices = this.assets.settings.sortIsolateListIndices;
    isolates.sort($.proxy(function(a, b) {
        for (var n = 0; n < sortIndices.length; n++) {
            var result = Sort.compareIsolateByCustomAttribute(a, b, this.assets.customAttributes[sortIndices[n]]);
            if (result != 0) {
                return result;
            }
        }
        return 0;
    }, this));
    if (sortIndices.length == 0) {
        isolates.sort(Sort.compareIsolateByName);
    }

    var length = isolates.length;
    for (var n = 0; n < length; n++) {
        //draw label
        isolates[n].raphListLabel = this.paper.text(5, n * 18 + 12, isolates[n].name)
            .attr({fill: isolates[n].color, "font-size": 14, "text-anchor": "start"});

        //attach isolate to Raphael object
        isolates[n].raphListLabel.source = isolates[n];

        //event handlers
        isolates[n].raphListLabel.click(this.onClick_isolate);
        isolates[n].raphListLabel.mouseover(this.onMouseOver_isolate);
        isolates[n].raphListLabel.mouseout(this.onMouseOut_isolate);

        //update paper size
        var width = 0.64 * 14 * isolates[n].name.length + 10;
        if (this.width < width) {
            this.width = width;
        }
    }

    //set paper size
    this.height = length * 18 + 12;
    this.paper.setSize(this.width, this.height);
};

//disposes the isolate list from the div container
IsolateList.prototype.dispose = function() {
    this.width = 0;
    this.height = 0;

    if (this.paper) {
        this.paper.clear();
        this.paper.remove();
    }
    $("#" + this.div).html("");
};

IsolateList.prototype.onClick_node = function(event) {
    var node = this.source;
    var tree = this.paper.source.assets.tree;
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

IsolateList.prototype.onMouseOver_node = function(event) {
    var node = this.source;
    var tree = this.paper.source.assets.tree;
    if (node.uiState == 0) {    //normal
        tree.highlightNode(node, true);
    }
};

IsolateList.prototype.onMouseOut_node = function(event) {
    var node = this.source;
    var tree = this.paper.source.assets.tree;
    if (node.uiState == 1) {    //highlighted
        tree.highlightNode(node, false);
    }
};

IsolateList.prototype.onClick_isolate = function(event) {
    var isolate = this.source;
    var tree = this.paper.source.assets.tree;
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

IsolateList.prototype.onMouseOver_isolate = function(event) {
    var isolate = this.source;
    var tree = this.paper.source.assets.tree;
    if (isolate.uiState == 0) {    //normal
        tree.highlightIsolate(isolate, true);
    }
};

IsolateList.prototype.onMouseOut_isolate = function(event) {
    var isolate = this.source;
    var tree = this.paper.source.assets.tree;
    if (isolate.uiState == 1) {    //highlighted
        tree.highlightIsolate(isolate, false);
    }
};