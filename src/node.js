function Node() {
    this.distance = 0;
    this.parent = null;
    this.children = new Array();
    this.isolates = new Array();
    this.raphNode = null;
    this.raphBranch = null;
    this.raphNodeBBox = null;
    this.raphBranchBBox = null;
    this.uiState = 0;   //0 = normal; 1 = highlighted; 2 = selected
}

Node.prototype.removeRaphNodeBBox = function() {
    if (this.raphNodeBBox) {
        this.raphNodeBBox.remove();
        this.raphNodeBBox = null;
    }
};

Node.prototype.removeRaphBranchBBox = function() {
    if (this.raphBranchBBox) {
        this.raphBranchBBox.remove();
        this.raphBranchBBox = null;
    }
};