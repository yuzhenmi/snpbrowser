function Assets() {
    this.tree = null;
    this.isolateList = null;
    this.alignment = null;
    this.menu = null;
    this.settings = null;
    this.legends = null;
    this.root = null;
    this.isolates = new Array();
    this.selectedIsolates = new Array();
    this.customAttributes = new Array();
    this.referenceSnps = new Array();
}

//populates isolates from root
Assets.prototype.populateIsolates = function() {
    var nodes = new Array();
    nodes.push(this.root);
    for (var n = 0; n < nodes.length; n++) {
        var length = nodes[n].children.length;
        for (var m = 0; m < length; m++) {
            nodes.push(nodes[n].children[m]);
        }
        length = nodes[n].isolates.length;
        for (var m = 0; m < length; m++) {
            this.isolates.push(nodes[n].isolates[m]);
        }
    }
    this.isolates.sort(Sort.compareIsolateByName);
};

//cleans assets for new set of data
Assets.prototype.clean = function() {
    this.tree.dispose();
    this.isolateList.dispose();
    this.alignment.dispose();
    this.menu.dispose();
    this.settings.dispose();
    this.legends.dispose();
    this.root = null;
    this.isolates = new Array();
    this.selectedIsolates = new Array();
    this.customAttributes = new Array();
    this.referenceSnps = new Array();
}