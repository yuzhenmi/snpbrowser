function Menu(div, assets) {
    this.div = div;
    this.assets = assets;

    this.legendsDialog = null;
}

//populates menu with UI elements
Menu.prototype.populate = function() {
    Misc.appendButton("button_menu_fileupload", "Upload Files", this.onClick_fileUpload, this.div, this);
    Misc.appendButton("button_menu_legends", "Legends", this.onClick_legends, this.div, this);
};

//disposes menu
Menu.prototype.dispose = function() {
    $("#" + this.div).html("");
};

Menu.prototype.onClick_legends = function() {
    if (!this.legendsDialog) {
        this.legendsDialog = $("#" + this.assets.legends.div).clone();
        this.legendsDialog.dialog({
            title: "Legends",
            autoOpen: true,
            width: 300,
            height: 600,
            close: $.proxy(this.onClick_legends_close, this),
            buttons: {
                "Close": $.proxy(function() {
                    this.legendsDialog.dialog("close");
                }, this)
            }
        });
    }
}

Menu.prototype.onClick_legends_close = function() {
    this.legendsDialog.remove();
    this.legendsDialog = null;
}

//creates modal popup for uploading files
Menu.prototype.onClick_fileUpload = function() {
    Misc.appendDiv("div_menu_fileupload", "", this.div, this);
    Misc.appendFile("div_menu_fileupload_tree", "Tree (.nwk) ", "div_menu_fileupload", this);
    $("#div_menu_fileupload").append("<br><br>");
    Misc.appendFile("div_menu_fileupload_isolates", "Isolates (.tsv) ", "div_menu_fileupload", this);
    $("#div_menu_fileupload").append("<br><br>");
    Misc.appendFile("div_menu_fileupload_snps", "SNPs (.gff) ", "div_menu_fileupload", this);
    $("#div_menu_fileupload").dialog({
        title: "File Upload",
        autoOpen: true,
        width: 600,
        height: 300,
        resizable: false,
        modal: true,
        buttons: {
            "Submit": $.proxy(this.onClick_fileUpload_submit, this),
            "Cancel": $.proxy(this.onClick_fileUpload_cancel, this)
        }
    });
};

Menu.prototype.onClick_fileUpload_onLoaded = function() {
    $("#div_menu_fileupload").dialog("close");
    $("#div_menu_fileupload").remove();

    //draw tree and isolate list
    this.assets.tree.draw();
    this.assets.isolateList.draw();
    this.assets.settings.update();
}

Menu.prototype.onClick_fileUpload_submit = function() {
    this.assets.clean();
    this.assets.menu.populate();
    this.assets.settings.populate();
    this.assets.legends.draw(new Array(), new Array());

    var treeFile = $("#div_menu_fileupload_tree").prop("files");
    for (var n = 0; n < treeFile.length; n++) {
        if (treeFile != null) {
            treeFile = treeFile[n];
            break;
        }
    }
    var isolatesFile = $("#div_menu_fileupload_isolates").prop("files");
    for (var n = 0; n < isolatesFile.length; n++) {
        if (isolatesFile != null) {
            isolatesFile = isolatesFile[n];
            break;
        }
    }
    var snpsFile = $("#div_menu_fileupload_snps").prop("files");
    for (var n = 0; n < snpsFile.length; n++) {
        if (snpsFile != null) {
            snpsFile = snpsFile[n];
            break;
        }
    }
    if (treeFile && isolatesFile && snpsFile) {
        var fileLoader = new FileLoader(treeFile, isolatesFile, snpsFile, $.proxy(this.onClick_fileUpload_onLoaded, this), this.assets);
    }
    else {
        alert("You need to choose files.");
    }
}

Menu.prototype.onClick_fileUpload_cancel = function() {
    $("#div_menu_fileupload").dialog("close");
    $("#div_menu_fileupload").remove();
}