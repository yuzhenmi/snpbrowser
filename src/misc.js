function Misc() {
}

//initializes settings, must be called at start
Misc.init = function() {
    Raphael.el.source = null;   //adds source as a field for Raphael objects
    Array.prototype.remove = function(object) {     //adds remove(object) as a method for Array
        this.splice(this.indexOf(object), 1);
    };
};

//appends button to div
Misc.appendButton = function(id, label, onclick, div, context) {
    $("#" + div).append("<input type=\"button\" id=\"" + id + "\" value=\"" + label + "\"/>");
    $("#" + id).click($.proxy(onclick, context));
};

//appends div to div
Misc.appendDiv = function(id, style, div, context) {
    $("#" + div).append("<div id=\"" + id + "\" style=\"" + style + "\"></div>");
}

//appends clear:both to div
Misc.appendClearFloats = function(div, context) {
    $("#" + div).append("<div style=\"clear: both;\"></div>");
}

//appends file input to div
Misc.appendFile = function(id, label, div, context) {
    $("#" + div).append(label + "<input type=\"file\" id=\"" + id + "\" style=\"border: solid 1px #000000;\">");
}

//appends select input to div
Misc.appendSelect = function(id, optionValues, optionLabels, onchange, div, context) {
    $("#" + div).append("<select id=\"" + id + "\"></select>");
    var length = optionLabels.length;
    for (var n = 0; n < length; n++) {
        $("#" + id).append("<option value=\"" + optionValues[n] + "\">" + optionLabels[n] + "</option>");
    }
    $("#" + id).change($.proxy(onchange, context));
}

//evaluates a boolean expression
Misc.evalBoolean = function(boolean) {
    var eval = Function("return " + boolean);
    return eval();
}