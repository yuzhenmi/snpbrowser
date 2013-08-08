function Settings(div, assets) {
    this.div = div;
    this.assets = assets;

    this.isolateColorIndex = -1;
    this.sortIsolateListIndices = new Array();
    this.sortAlignmentIndices = new Array();

    this.selectIsolateAttributeIndices = null;
    this.selectIsolateOptionIndices = null;
    this.selectIsolateEqualIndices = null;
    this.selectIsolateBooleanIndices = null;
}

//populates settings with UI elements
Settings.prototype.populate = function() {
    Misc.appendButton("button_settings_updateAlignment", "Update Alignment", this.onClick_updateAlignment, this.div, this);
    Misc.appendButton("button_settings_selectIsolates", "Select Isolates", this.onClick_selectIsolates, this.div, this);
    Misc.appendButton("button_settings_clearSelections", "Clear Selections", this.onClick_clearSelections, this.div, this);

    var optionValues = new Array();
    var optionLabels = new Array();
    optionValues.push(-1);
    optionLabels.push("off");
    var length = this.assets.customAttributes.length;
    for (var n = 0; n < length; n++) {
        optionValues.push(n);
        optionLabels.push(this.assets.customAttributes[n]);
    }

    $("#" + this.div).append("<br>Isolate color:<br>&nbsp&nbsp&nbsp&nbsp");
    Misc.appendSelect("select_settings_isolateColor", optionValues, optionLabels, this.onChange_isolateColor, this.div, this);
    $("#select_settings_isolateColor").val(this.isolateColorIndex);

    length = this.sortIsolateListIndices.length;
    $("#" + this.div).append("<br>Sort isolate list:");
    for (n = 0; n < length; n++) {
        $("#" + this.div).append("<br>&nbsp&nbsp&nbsp&nbsp");
        Misc.appendSelect("select_settings_sortIsolateList" + n, optionValues, optionLabels, this.onChange_sortIsolateList, this.div, this);
        $("#select_settings_sortIsolateList" + n).val(this.sortIsolateListIndices[n]);
    }
    $("#" + this.div).append("<br>&nbsp&nbsp&nbsp&nbsp");
    Misc.appendSelect("select_settings_sortIsolateList" + length, optionValues, optionLabels, this.onChange_sortIsolateList, this.div, this);
    $("#select_settings_sortIsolateList" + length).val(-1);

    length = this.sortAlignmentIndices.length;
    $("#" + this.div).append("<br>Sort alignment:");
    for (n = 0; n < this.sortAlignmentIndices.length; n++) {
        $("#" + this.div).append("<br>&nbsp&nbsp&nbsp&nbsp");
        Misc.appendSelect("select_settings_sortAlignment" + n, optionValues, optionLabels, this.onChange_sortAlignment, this.div, this);
        $("#select_settings_sortAlignment" + n).val(this.sortAlignmentIndices[n]);
    }
    $("#" + this.div).append("<br>&nbsp&nbsp&nbsp&nbsp");
    Misc.appendSelect("select_settings_sortAlignment" + length, optionValues, optionLabels, this.onChange_sortAlignment, this.div, this);
    $("#select_settings_sortAlignment" + length).val(-1);
};

//updates settings without losing user inputs
Settings.prototype.update = function() {
    $("#" + this.div).html("");
    this.populate();
}

//disposes settings
Settings.prototype.dispose = function() {
    this.isolateColorIndex = -1;
    this.sortIsolateListIndices = new Array();
    this.sortAlignmentIndices = new Array();

    $("#" + this.div).html("");
};

//clears selections
Settings.prototype.onClick_clearSelections = function() {
    this.assets.tree.selectNode(this.assets.root, false, true);
}

//select isolates by boolean expression
Settings.prototype.onClick_selectIsolates = function() {
    Misc.appendDiv("div_settings_selectisolates", "", this.div, this);
    this.selectIsolateAttributeIndices = new Array();
    this.selectIsolateOptionIndices = new Array();
    this.selectIsolateBooleanIndices = new Array();
    this.selectIsolateEqualIndices = new Array();
    this.updateSelectIsolates();
    $("#div_settings_selectisolates").dialog({
        title: "Select Isolates",
        autoOpen: true,
        width: 600,
        height: 500,
        resizable: false,
        modal: true,
        buttons: {
            "Submit": $.proxy(this.onClick_selectIsolates_submit, this),
            "Cancel": $.proxy(this.onClick_selectIsolates_cancel, this)
        }
    });
    //interpret expression and select isolates
}

Settings.prototype.updateSelectIsolates = function() {
    $("#div_settings_selectisolates").html("");

    var booleanOptionValues = new Array();
    var booleanOptionLabels = new Array();
    booleanOptionValues.push(0);
    booleanOptionLabels.push("and");
    booleanOptionValues.push(1);
    booleanOptionLabels.push("or");

    var attributeOptionValues = new Array();
    var attributeOptionLabels = new Array();
    attributeOptionValues.push(-1);
    attributeOptionLabels.push("off");
    var length = this.assets.customAttributes.length;
    for (var n = 0; n < length; n++) {
        attributeOptionValues.push(n);
        attributeOptionLabels.push(this.assets.customAttributes[n]);
    }

    var equalOptionValues = new Array();
    var equalOptionLabels = new Array();
    equalOptionValues.push(0);
    equalOptionLabels.push("equal");
    equalOptionValues.push(1);
    equalOptionLabels.push("not equal");

    length = this.selectIsolateAttributeIndices.length;
    var customAttributes = this.assets.customAttributes;
    var isolates = this.assets.isolates;
    var _length = isolates.length;
    for (n = 0; n < length; n++) {
        Misc.appendSelect("select_settings_selectisolateattribute" + n, attributeOptionValues, attributeOptionLabels, this.onChange_selectIsolates, "div_settings_selectisolates", this);
        $("#select_settings_selectisolateattribute" + n).val(this.selectIsolateAttributeIndices[n]);

        Misc.appendSelect("select_settings_selectisolateequal" + n, equalOptionValues, equalOptionLabels, this.onChange_selectIsolates, "div_settings_selectisolates", this);
        $("#select_settings_selectisolateequal" + n).val(this.selectIsolateEqualIndices[n]);

        var optionOptionValues = new Array();
        var optionOptionLabels = new Array();
        var options = new Array();
        for (var m = 0; m < _length; m++) {
            var option = isolates[m].customAttributes[customAttributes[this.selectIsolateAttributeIndices[n]]];
            if (option != null && options.indexOf(option) < 0) {
                options.push(option);
            }
        }
        options.sort();
        for (m = 0; m < options.length; m++) {
            optionOptionValues.push(m);
            optionOptionLabels.push(options[m]);
        }
        Misc.appendSelect("select_settings_selectisolateoption" + n, optionOptionValues, optionOptionLabels, this.onChange_selectIsolates, "div_settings_selectisolates", this);
        $("#select_settings_selectisolateoption" + n).val(this.selectIsolateOptionIndices[n]);

        Misc.appendSelect("select_settings_selectisolateboolean" + n, booleanOptionValues, booleanOptionLabels, this.onChange_selectIsolates, "div_settings_selectisolates", this);
        $("#select_settings_selectisolateboolean" + n).val(this.selectIsolateBooleanIndices[n]);
    }
    Misc.appendSelect("select_settings_selectisolateattribute" + length, attributeOptionValues, attributeOptionLabels, this.onChange_selectIsolates, "div_settings_selectisolates", this);
    $("#select_settings_selectisolateattribute" + length).val(-1);
}

Settings.prototype.onChange_selectIsolates = function() {
    this.selectIsolateBooleanIndices = new Array();
    this.selectIsolateAttributeIndices = new Array();
    this.selectIsolateOptionIndices = new Array();
    this.selectIsolateEqualIndices = new Array();

    var n = 0;
    var element = $("#select_settings_selectisolateboolean" + n);
    while (element.length && element.val() > -1) {
        this.selectIsolateBooleanIndices.push(element.val());
        n++;
        element = $("#select_settings_selectisolateboolean" + n);
    }

    n = 0;
    element = $("#select_settings_selectisolateattribute" + n);
    while (element.length && element.val() > -1) {
        this.selectIsolateAttributeIndices.push(element.val());
        n++;
        element = $("#select_settings_selectisolateattribute" + n);
    }

    n = 0;
    element = $("#select_settings_selectisolateoption" + n);
    while (element.length && element.val() > -1) {
        this.selectIsolateOptionIndices.push(element.val());
        n++;
        element = $("#select_settings_selectisolateoption" + n);
    }

    n = 0;
    element = $("#select_settings_selectisolateequal" + n);
    while (element.length && element.val() > -1) {
        this.selectIsolateEqualIndices.push(element.val());
        n++;
        element = $("#select_settings_selectisolateequal" + n);
    }

    if (this.selectIsolateBooleanIndices.length < this.selectIsolateAttributeIndices.length) {
        this.selectIsolateBooleanIndices.push(0);
    }
    if (this.selectIsolateOptionIndices.length < this.selectIsolateAttributeIndices.length) {
        this.selectIsolateOptionIndices.push(0);
    }
    if (this.selectIsolateEqualIndices.length < this.selectIsolateAttributeIndices.length) {
        this.selectIsolateEqualIndices.push(0);
    }

    this.updateSelectIsolates();
}

Settings.prototype.onClick_selectIsolates_submit = function() {
    var isolates = this.assets.isolates;
    var length = isolates.length;
    var customAttributes = this.assets.customAttributes;
    var _length = this.selectIsolateAttributeIndices.length;

    var selectedOptions = new Array();
    for (var n = 0; n < _length; n++) {
        var options = new Array();
        for (var m = 0; m < length; m++) {
            var option = isolates[m].customAttributes[customAttributes[this.selectIsolateAttributeIndices[n]]];
            if (option != null && options.indexOf(option) < 0) {
                options.push(option);
            }
        }
        options.sort();
        selectedOptions.push(options[this.selectIsolateOptionIndices[n]]);
    }

    this.assets.tree.highlightNode(this.assets.root, false);  //dehighlight everything

    for (n = 0; n < length; n++) {
        var expression = "";
        for (var m = 0; m < _length; m++) {
            var attributeValue = isolates[n].customAttributes[customAttributes[this.selectIsolateAttributeIndices[m]]];
            if (this.selectIsolateEqualIndices[m] == 1) {     //not equal
                expression += "!";
            }
            if (attributeValue == selectedOptions[m]) {
                expression += "true";
            }
            else {
                expression += "false";
            }
            if (m + 1 < _length) {  //not last line
                if (this.selectIsolateBooleanIndices[m] == 0) {   //and
                    expression += "&&";
                }
                else if (this.selectIsolateBooleanIndices[m] == 1) {  //or
                    expression += "||";
                }
            }
        }

        //evaluate expression
        if (Misc.evalBoolean(expression)) {
            if (isolates[n].uiState == 0) {
                this.assets.tree.selectIsolate(isolates[n], true);
            }
        }
    }

    $("#div_settings_selectisolates").dialog("close");
    $("#div_settings_selectisolates").remove();
    this.selectIsolateAttributeIndices = null;
    this.selectIsolateOptionIndices = null;
    this.selectIsolateBooleanIndices = null;
    this.selectIsolateEqualIndices = null;
}

Settings.prototype.onClick_selectIsolates_cancel = function() {
    $("#div_settings_selectisolates").dialog("close");
    $("#div_settings_selectisolates").remove();
    this.selectIsolateAttributeIndices = null;
    this.selectIsolateOptionIndices = null;
    this.selectIsolateBooleanIndices = null;
    this.selectIsolateEqualIndices = null;
}

//updates alignment
Settings.prototype.onClick_updateAlignment = function() {
    this.assets.alignment.dispose();
    this.assets.alignment.draw();
}

Settings.prototype.onChange_isolateColor = function() {
    this.isolateColorIndex = $("#select_settings_isolateColor").val();
    this.update();

    //assign colors to isolates
    var isolates = this.assets.isolates;
    var length = isolates.length;
    if (this.isolateColorIndex >= 0) {    //not off
        //get unique attribute options
        var customAttributes = this.assets.customAttributes;
        var options = new Array();
        for (var n = 0; n < length; n++) {
            var option = isolates[n].customAttributes[customAttributes[this.isolateColorIndex]];
            if (option != null && options.indexOf(option) < 0) {
                options.push(option);
            }
        }
        options.sort();

        //set color
        var colors = new Array();
        var gap = 1536 / options.length;
        for (n = 0; n < options.length; n++) {
            var color = Math.floor(n * gap);
            if (color < 256) {
                color = (color * 256 + 16711680).toString(16);
            }
            else if (color < 512) {
                color = ((511 - color) * 65536 + 65280).toString(16);
            }
            else if (color < 768) {
                color = ((color - 512) + 65280).toString(16);
            }
            else if (color < 1024) {
                color = ((1023 - color) * 256 + 255).toString(16);
            }
            else if (color < 1280) {
                color = ((color - 1024) * 65536 + 255).toString(16);
            }
            else if (color < 1536) {
                color = ((1535 - color) + 16711680).toString(16);
            }
            while (color.length < 6) {
                color = "0" + color;
            }
            colors.push("#" + color);
        }

        this.assets.legends.dispose();
        this.assets.legends.draw(options, colors);

        for (n = 0; n < length; n++) {
            var index = options.indexOf(isolates[n].customAttributes[customAttributes[this.isolateColorIndex]]);
            if (index < 0) {       //attribute unspecified
                isolates[n].color = "#000000";
            }
            else {
                isolates[n].color = colors[index];
            }
        }

    }
    else {      //off
        for (var n = 0; n < length; n++) {
            isolates[n].color = "#000000";
        }
        this.assets.legends.dispose();
        this.assets.legends.draw(new Array(), new Array());
    }

    //update tree and isolate list
    for (var n = 0; n < length; n++) {
        isolates[n].raphTreeLabel.attr({fill: isolates[n].color});
        isolates[n].raphListLabel.attr({fill: isolates[n].color});
    }

    //update alignment
    isolates = this.assets.alignment.isolates;
    if (isolates) {
        var raphIsolateLabels = this.assets.alignment.raphIsolateLabels;
        length = isolates.length;
        for (var n = 0; n < length; n++) {
            raphIsolateLabels[n + 1].attr({fill: isolates[n].color});
        }
    }
}

Settings.prototype.onChange_sortIsolateList = function() {
    this.sortIsolateListIndices = new Array();
    var n = 0;
    var element = $("#select_settings_sortIsolateList" + n);
    while (element.length && element.val() > -1) {
        this.sortIsolateListIndices.push(element.val());
        n++;
        element = $("#select_settings_sortIsolateList" + n);
    }
    this.update();

    //sort isolates
    var isolates = this.assets.isolates;
    var sortIndices = this.sortIsolateListIndices;
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

    //update UI
    var length = isolates.length;
    for (var n = 0; n < length; n++) {
        var bBox = isolates[n].raphListLabel.attr({y: n * 18 + 12}).getBBox();
        if (isolates[n].raphListBBox) {
            isolates[n].raphListBBox.attr({y: bBox.y});
        }
    }
}

Settings.prototype.onChange_sortAlignment = function() {
    this.sortAlignmentIndices = new Array();
    var n = 0;
    var element = $("#select_settings_sortAlignment" + n);
    while (element.length && element.val() > -1) {
        this.sortAlignmentIndices.push(element.val());
        n++;
        element = $("#select_settings_sortAlignment" + n);
    }
    this.update();
}