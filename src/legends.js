function Legends(div, assets) {
    this.div = div;
    this.paper = null;
    this.assets = assets;
    this.width = 0;
    this.height = 0;

    $("#" + div).hide();
}

Legends.prototype.draw = function(isolateColorOptions, isolateColorColors) {
    $("#" + this.div).show();

    this.paper = Raphael(this.div, 1, 1);
    this.paper.source = this;

    var bBox = this.paper.text(5, 14, "Isolate label")
        .attr({fill: "#000000", "font-size": 18, "text-anchor": "start"}).getBBox();
    this.width = bBox.x + bBox.width;

    var length = isolateColorOptions.length;
    for (var n = 0; n < length; n++) {
        this.paper.rect(15, n * 18 + 30, 14, 14)
            .attr({fill: isolateColorColors[n], stroke: isolateColorColors[n]});
        bBox = this.paper.text(34, n * 18 + 37, isolateColorOptions[n])
            .attr({fill: isolateColorColors[n], "font-size": 14, "text-anchor": "start"}).getBBox();
        var width = bBox.x + bBox.width;
        if (width > this.width) {
            this.width = width;
        }
    }
    this.paper.rect(15, length * 18 + 30, 14, 14)
        .attr({fill: "#000000", stroke: isolateColorColors[length]});
    bBox = this.paper.text(34, length * 18 + 37, "Not specified")
        .attr({fill: "#000000", "font-size": 14, "text-anchor": "start"}).getBBox();
    var width = bBox.x + bBox.width;
    if (width > this.width) {
        this.width = width;
    }
    this.width += 5;
    this.height = bBox.y + bBox.height + 5;

    //set paper size
    this.paper.setSize(this.width, this.height);

    $("#" + this.div).hide();
}

Legends.prototype.dispose = function() {
    this.width = 0;
    this.height = 0;

    if (this.paper) {
        this.paper.clear();
        this.paper.remove();
    }
    $("#" + this.div).html("");
}