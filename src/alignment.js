function Alignment(div, assets) {
    this.div = div;
    this.alignmentDiv = div + "_alignment";
    this.isolateLabelDiv = div + "_isolatelabel";
    this.alignmentPaper = null;
    this.isolateLabelPaper = null;
    this.assets = assets;
    this.alignmentWidth = 0;
    this.alignmentHeight = 0;
    this.isolateLabelWidth = 0;
    this.isolateLabelHeight = 0;

    this.raphMatrix = null;
    this.raphIsolateLabels = null;
    this.isolates = null;
}

//draws alignment
Alignment.prototype.draw = function() {
    Misc.appendDiv(this.isolateLabelDiv, "height:100%;float:left;overflow:hidden;", this.div, this);
    Misc.appendDiv(this.alignmentDiv, "height:100%;overflow:auto;", this.div, this);

    //bind scrolling
    $("#" + this.alignmentDiv).scroll($.proxy(function () {
        $("#" + this.isolateLabelDiv).scrollTop($("#" + this.alignmentDiv).scrollTop());
    }, this));

    this.isolateLabelPaper = Raphael(this.isolateLabelDiv, 1, 1);
    this.isolateLabelPaper.source = this;

    this.alignmentPaper = Raphael(this.alignmentDiv, 1, 1);
    this.alignmentPaper.source = this;

    var referenceSnps = this.assets.referenceSnps;
    this.isolates = this.assets.selectedIsolates.slice(0);
    var x = new Array();

    //sort isolates
    var sortIndices = this.assets.settings.sortAlignmentIndices;
    this.isolates.sort($.proxy(function(a, b) {
        for (var n = 0; n < sortIndices.length; n++) {
            var result = Sort.compareIsolateByCustomAttribute(a, b, this.assets.customAttributes[sortIndices[n]]);
            if (result != 0) {
                return result;
            }
        }
        return 0;
    }, this));
    if (sortIndices.length == 0) {
        this.isolates.sort(Sort.compareIsolateByName);
    }

    //look for snps in selected isolates
    var length = referenceSnps.length;
    for (var n = 0; n < length; n++) {
        var y = new Array();
        y.push(referenceSnps[n]);      //first snp in column is reference

        //fill column with snps from selected isolates
        var _length = this.isolates.length;
        for (var m = 0; m < _length; m++) {
            var snp = this.isolates[m].containSnp(referenceSnps[n]);
            if (snp) {
                y.push(snp);
            }
            else {
                y.push(referenceSnps[n]);
            }
        }

        //check whether snps in column are polymorphic
        var isPolymorphic = false;
        _length = y.length;
        for (m = 2; m < _length; m++) {
            if (y[m].nucleotide != y[1].nucleotide) {
                isPolymorphic = true;
            }
        }

        if (isPolymorphic) {
            x.push(y);
        }
    }

    if (x.length > 0) {
        //draw alignment
        length = x.length;
        this.raphMatrix = new Array(length);    //initialize matrix column
        for (n = 0; n < length; n++) {  //column
            var _length = x[n].length;
            this.raphMatrix[n] = new Array(_length);    //initialize matrix row
            this.raphMatrix[n][0] = this.alignmentPaper.rect(n * 10, 0, 10, 10)
                .attr({fill: this.getNucleotideColor(x[n][0].nucleotide), stroke: "#ffffff"});
            this.raphMatrix[n][0].click(this.onClick_matrix);
            this.raphMatrix[n][0].mouseover(this.onMouseOver_matrix);
            this.raphMatrix[n][0].mouseout(this.onMouseOut_matrix);
            this.raphMatrix[n][0].source = new Point(n, 0);
            this.raphMatrix[n][0].source.snp = x[n][0];     //allow access to reference snps from raphMatrix
            for (var m = 1; m < _length; m++) {
                this.raphMatrix[n][m] = this.alignmentPaper.rect(n * 10, m * 10, 10, 10)
                    .attr({fill: this.getNucleotideColor(x[n][m].nucleotide), stroke: "#ffffff"});
                this.raphMatrix[n][m].click(this.onClick_matrix);
                this.raphMatrix[n][m].mouseover(this.onMouseOver_matrix);
                this.raphMatrix[n][m].mouseout(this.onMouseOut_matrix);
                this.raphMatrix[n][m].source = new Point(n, m);
            }
        }

        //set paper size
        this.alignmentWidth = x.length * 10;
        this.alignmentHeight = x[0].length * 10;
        this.alignmentPaper.setSize(this.alignmentWidth, this.alignmentHeight);

        //draw isolate label
        length = x[0].length;
        this.raphIsolateLabels = new Array(length);
        this.raphIsolateLabels[0] = this.isolateLabelPaper.text(0, 5, "Reference")
            .attr({fill: "#000000", "font-size": 9, "text-anchor": "start"});
        this.raphIsolateLabels[0].click(this.onClick_isolateLabel);
        this.raphIsolateLabels[0].mouseover(this.onMouseOver_isolateLabel);
        this.raphIsolateLabels[0].mouseout(this.onMouseOut_isolateLabel);
        this.raphIsolateLabels[0].source = new Point(null, 0);
        this.isolateLabelWidth = this.raphIsolateLabels[0].getBBox().width;
        for (var n = 1; n < length; n++) {
            this.raphIsolateLabels[n] = this.isolateLabelPaper.text(0, n * 10 + 5, this.isolates[n - 1].name)
                .attr({fill: this.isolates[n - 1].color, "font-size": 9, "text-anchor": "start"});
            this.raphIsolateLabels[n].click(this.onClick_isolateLabel);
            this.raphIsolateLabels[n].mouseover(this.onMouseOver_isolateLabel);
            this.raphIsolateLabels[n].mouseout(this.onMouseOut_isolateLabel);
            this.raphIsolateLabels[n].source = new Point(null, n);
            var bBox = this.raphIsolateLabels[n].getBBox();
            if (bBox.width > this.isolateLabelWidth) {
                this.isolateLabelWidth = bBox.width;
            }
        }

        //set paper size
        this.isolateLabelWidth += 5;
        this.isolateLabelHeight = this.raphIsolateLabels[length - 1].getBBox().y + this.raphIsolateLabels[length - 1].getBBox().height;
        this.isolateLabelPaper.setSize(this.isolateLabelWidth, this.isolateLabelHeight);

        //set isolate label div width
        $("#" + this.isolateLabelDiv).width(this.isolateLabelWidth + 5);

        //clear floats
        Misc.appendClearFloats(this.div, this);
    }
};

//returns color corresponding to a nucleotide
Alignment.prototype.getNucleotideColor = function(nucleotide) {
    if (nucleotide == "A") {
        return "#00ff00";
    }
    else if (nucleotide == "T") {
        return "#ff0000";
    }
    else if (nucleotide == "G") {
        return "#000000";
    }
    else if (nucleotide == "C") {
        return "#0000ff";
    }
}

//disposes the alignment from the div container
Alignment.prototype.dispose = function() {
    this.alignmentWidth = 0;
    this.alignmentHeight = 0;
    this.isolateLabelWidth = 0;
    this.isolateLabelHeight = 0;

    this.raphMatrix = null;
    this.raphIsolateLabels = null;
    this.isolates = null;

    if (this.alignmentPaper) {
        this.alignmentPaper.clear();
        this.alignmentPaper.remove();
    }

    if (this.isolateLabelPaper) {
        this.isolateLabelPaper.clear();
        this.isolateLabelPaper.remove();
    }

    $("#" + this.alignmentDiv).html("");
    $("#" + this.isolateLabelDiv).html("");
    $("#" + this.div).html("");
};

Alignment.prototype.onClick_isolateLabel = function(event) {
    var position = this.source;
    var alignment = this.paper.source;
    var isolate = alignment.isolates[position.y];
    //TODO finish handling event
};

Alignment.prototype.onMouseOver_isolateLabel = function(event) {
    var position = this.source;
    var alignment = this.paper.source;
    var isolate = alignment.isolates[position.y];
};

Alignment.prototype.onMouseOut_isolateLabel = function(event) {
    var position = this.source;
    var alignment = this.paper.source;
    var isolate = alignment.isolates[position.y];
};

Alignment.prototype.onClick_matrix = function(event) {
    var position = this.source;
    var alignment = this.paper.source;
    var isolate = alignment.isolates[position.y];
    var referenceSnp = alignment.raphMatrix[position.x][0];
    //TODO finish handling event
};

Alignment.prototype.onMouseOver_matrix = function(event) {
    var position = this.source;
    var alignment = this.paper.source;
    var isolate = alignment.isolates[position.y];
    var referenceSnp = alignment.raphMatrix[position.x][0];
};

Alignment.prototype.onMouseOut_matrix = function(event) {
    var position = this.source;
    var alignment = this.paper.source;
    var isolate = alignment.isolates[position.y];
    var referenceSnp = alignment.raphMatrix[position.x][0];
};

