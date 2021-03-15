function Graph() {
    console.log('Graph()');

    this.setup();
}

Graph.prototype.setup = function () {
    console.log('Graph.setup()');
    this.nodes = [];
    this.edges = new Map();
}

Graph.prototype.addNode = function (n) { 
    console.log('[add_node] ' + n);
    this.nodes.push(n); 
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
            this.addEdge(this.nodes[node1], this.nodes[node2], 1);
        }
    }

}

Graph.prototype.weightedRandomInt = function (data) {
    console.log('[weightedRandomInt]'); 
    console.log(data); 
    total = 0;
    for (let i = 0; i < data.length; ++i) {
        total += data[i][1];
    }

    const threshold = Math.random() * total;

    let total = 0;
    for (let i = 0; i < data.length - 1; ++i) {
        // Add the weight to our running total.
        total += data[i][1];

        // If this value falls within the threshold, we're done!
        if (total >= threshold) {
            return data[i][0];
        }
    }

    return data[data.length - 1][0];
}

Graph.prototype.getRandomInt = function (min, max) {
    // Generate a pseudo-random integer between min and max
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


Graph.prototype.getRandomNode = function() {
    console.log('[getRandomNode]');
    var next = getRandomInt(0,this.nodes.length-1);
    console.log(next);
    console.log(this.nodes);
    return this.nodes[next];

}

Graph.prototype.step = function (node) {
    /**
     *
     */
 
    console.log('[step] ' + node);
 
    var transitions = this.nodes.get(n);

    var selected_transition = this.weightedRandomInt(transitions);

    console.log(selected_transition);

    console.log(transitions[selected_transition]);
    
}


