function FileLoader(treeFile, isolatesFile, snpsFile, onLoaded, assets) {
    this.treeFile = treeFile;
    this.isolatesFile = isolatesFile;
    this.snpsFile = snpsFile;
    this.onLoaded = onLoaded;
    this.assets = assets;

    this.treeFileContent = null;
    this.isolatesFileContent = null;
    this.snpsFileContent = null;

    this.readTreeFile();
    this.readIsolatesFile();
    this.readSnpsFile();
}

FileLoader.prototype.readTreeFile = function() {
    var fileReader = new FileReader();
    fileReader.onload = $.proxy(function(event) {
        this.treeFileContent = event.target.result;
        this.loadFiles();
    }, this);
    fileReader.readAsText(this.treeFile);
}

FileLoader.prototype.readIsolatesFile = function() {
    var fileReader = new FileReader();
    fileReader.onload = $.proxy(function(event) {
        this.isolatesFileContent = event.target.result;
        this.loadFiles();
    }, this);
    fileReader.readAsText(this.isolatesFile);
}

FileLoader.prototype.readSnpsFile = function() {
    var fileReader = new FileReader();
    fileReader.onload = $.proxy(function(event) {
        this.snpsFileContent = event.target.result;
        this.loadFiles();
    }, this);
    fileReader.readAsText(this.snpsFile);
}

FileLoader.prototype.loadFiles = function() {
    if (this.treeFileContent && this.isolatesFileContent && this.snpsFileContent) {   //ready to load
        this.tree(this.treeFileContent, "newick");
        this.isolates(this.isolatesFileContent, "tsv");
        this.snps(this.snpsFileContent, "gff");
        this.onLoaded();
    }
}

//loads tree file
FileLoader.prototype.tree = function(file, type) {
    if (type == "newick") {
        var lines = file.split("\n");
        this.assets.root = Parser.parseNewick(lines[0]);
        this.assets.populateIsolates();
    }
};

//loads isolates file
FileLoader.prototype.isolates = function(file, type) {
    if (type == "tsv") {
        var lines = file.split("\n");
        var isolates = this.assets.isolates.slice(0);   //clone isolates array
        var length = lines.length;
        for (var n = 0; n < length; n++) {
            if (lines[n][0] == "#") {   //comment
                continue;
            }

            var data = lines[n].split("\t");
            for (var m = 0; m < isolates.length; m++) {
                if (data[0] == isolates[m].name) {    //found matching isolate
                    var _data = data[1].split("");
                    for (var i = 0; i < _data.length; i++) {
                        var snp = new Snp();
                        snp.nucleotide = _data[i];
                        isolates[m].snps.push(snp);
                    }
                    if (data.length > 2) {      //has custom data
                        _data = data[2].split(";");
                        for (i = 0; i < _data.length; i++) {
                            var keyValuePair = _data[i].split("=");
                            if (this.assets.customAttributes.indexOf(keyValuePair[0]) < 0) {
                                this.assets.customAttributes.push(keyValuePair[0]);
                            }
                            isolates[m].customAttributes[keyValuePair[0]] = keyValuePair[1];
                        }
                    }
                    isolates[m].isLoaded = true;
                    isolates.splice(m, 1);
                    break;
                }
            }
        }
    }
};

//load snps file
FileLoader.prototype.snps = function(file, type) {
    if (type == "gff") {
        var lines = file.split("\n");
        var isolates = this.assets.isolates;
        var isolatesLength = isolates.length;
        var index = 0;
        var length = lines.length;
        for (var n = 0; n < length; n++) {
            if (lines[n][0] == "#") {   //comment
                continue;
            }

            var data = lines[n].split("\t");
            if (data[2] == "SNP") {     //snp
                //custom attributes
                var _data = data[8].split(";");
                var referenceNucleotide = "";
                for (var m = 0; m < _data.length; m++) {
                    var keyValuePair = _data[m].split("=");
                    if (keyValuePair[0] == "reference_seq") {
                        referenceNucleotide = keyValuePair[1];
                    }
                }

                //add reference snp
                var snp = new Snp();
                snp.contig = data[0];
                snp.start = data[3];
                snp.end = data[4];
                snp.nucleotide = referenceNucleotide;
                this.assets.referenceSnps.push(snp);

                //load snp
                for (m = 0; m < isolatesLength; m++) {
                    snp = isolates[m].snps[index];
                    snp.contig = data[0];
                    snp.start = data[3];
                    snp.end = data[4];
                }
                index ++;
            }
        }

        //remove snps where nucleotide = referenceNucleotide
        var referenceSnps = this.assets.referenceSnps;
        for (n = referenceSnps.length - 1; n >= 0; n--) {
            length = isolates.length;
            for (var m = 0; m < length; m++) {
                if (isolates[m].snps[n].nucleotide == referenceSnps[n].nucleotide) {
                    isolates[m].snps.remove(isolates[m].snps[n]);
                }
            }
        }
    }
};