function Parser() {
}

//parses Newick string to nodes without grouping
Parser.parseNewick1 = function(node, parent, n, newick) {
    node.children = new Array();
    node.name = "";
    node.distance = 0;
    var buffer = "";

    var cleanup = function() {
        node.distance = Number(buffer);
        node.parent = parent;
        if (parent) {
            parent.children.push(node);
        }
    }

    var length = newick.length;
    for (n++; n < length; n++) {
        if (newick[n] == "(") {
            n = Parser.parseNewick1(new Object(), node, n, newick);
        }
        else if (newick[n] == ")") {
            cleanup();
            return n;
        }
        else if (newick[n] == ",") {
            cleanup();
            return Parser.parseNewick1(new Object(), parent, n, newick);
        }
        else if (newick[n] == ":") {
            if (isNaN(Number(buffer))) {
                node.name = buffer;
            }
            buffer = "";
        }
        else if (newick[n] == ";") {
            return newick.length;
        }
        else {
            buffer += newick[n];
        }
    }
};

//groups parsed nodes
Parser.parseNewick2 = function(oldNode, parent) {
    var node = new Node();
    node.parent = parent;
    node.distance = oldNode.distance;

    var createIsolate = function(oldNode, node) {
        var isolate = new Isolate();
        isolate.name = oldNode.name;
        isolate.node = node;
        return isolate;
    }

    var _node = new Node();
    _node.parent = node;
    _node.distance = 0;
    if (oldNode.name.length > 0) {
        _node.isolates.push(createIsolate(oldNode, _node));
    }

    for (var n = 0; n < oldNode.children.length; n++) {
        if (oldNode.children[n].distance > 0) {
            node.children.push(Parser.parseNewick2(oldNode.children[n], node));
        }
        else {
            if (oldNode.children[n].name.length > 0) {
                _node.isolates.push(createIsolate(oldNode.children[n], _node));
            }
            for (var m = 0; m < oldNode.children[n].children.length; m++) {
                oldNode.children.push(oldNode.children[n].children[m]);
            }
        }
    }

    if (_node.isolates.length > 0) {
        node.children.push(_node);
        _node.isolates.sort(Sort.compareNodeByName);
    }

    return node;
};

//parses Newick string
Parser.parseNewick = function(newick) {
    var root = new Object();
    var n = Parser.parseNewick1(root, null, -1, newick);
    return Parser.parseNewick2(root, null);
};