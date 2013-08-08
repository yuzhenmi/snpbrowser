function Isolate() {
    this.raphTreeLabel = null;
    this.raphListLabel = null;
    this.raphTreeBBox = null;
    this.raphListBBox = null;
    this.name = "";
    this.node = null;
    this.uiState = 0;   //0 = normal; 1 = highlighted; 2 = selected
    this.snps = new Array();
    this.isLoaded = false;
    this.customAttributes = new Object();
    this.color = "#000000";
}

Isolate.prototype.removeRaphTreeBBox = function() {
    if (this.raphTreeBBox) {
        this.raphTreeBBox.remove();
        this.raphTreeBBox = null;
    }
};

Isolate.prototype.removeRaphListBBox = function() {
    if (this.raphListBBox) {
        this.raphListBBox.remove();
        this.raphListBBox = null;
    }
};

Isolate.prototype.containSnp = function(snp) {
    var length = this.snps.length;
    for (var n = 0; n < length; n++) {
        var _snp = this.snps[n];
        if (_snp.contig == snp.contig && _snp.start == snp.start && _snp.end == snp.end) {
            return _snp;
        }
    }
    return null;
}