function Graph() {
    console.log('Graph()');

    this.setup();
}

Graph.prototype.setup = function () {
    console.log('Graph.setup()');
    this.edges = new Map();

}

Graph.prototype.addNode = function (n) { 
    console.log('[add_node] ' + n);
    this.edges.set(n, []); 
}

Graph.prototype.addEdge = function (n, e, w) {
    console.log('[add_edge] ' + n + ' || ' + e + ' || ' + w);
    this.edges.get(n).push([e, w]);
}

Graph.prototype.fromIndex = function(index) {
    console.log('fromIndex() ' + index.length );
    this.index = index;  
    for(element in this.index) {
        let nodeId = this.index[element][6];
        this.addNode(nodeId);
    } 

    for(node1 in this.nodes) { 
        for(node2 in this.nodes) { 
            this.addEdge(node1, node2, 0);
        }
    }

}
