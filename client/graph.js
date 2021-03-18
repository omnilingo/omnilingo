class Graph { 

    constructor(noOfNodes) 
    { 
        this.noOfNodes = noOfNodes; 
        this.Nodes = new Map(); 
        this.Weights = new Map(); 
        this.AdjList = new Map(); 
    }

    getNode(v) 
    {
        return this.Nodes.get(v);
    }
    
    addNode(v, d) 
    { 
        this.Nodes.set(v, d);
        this.AdjList.set(v, []); 
    } 

    getWeight(v) 
    {
        return this.Weights.get(v);
    }

    setWeight(v, w) 
    {
        this.Weights.set(v, w);
    }

    addEdge(v, w) 
    { 
        this.AdjList.get(v).push(w); 
        this.AdjList.get(w).push(v); 
    } 
    
    shuffleArray(array) 
    {
       let curId = array.length;
       // There remain elements to shuffle
       while (0 !== curId) {
          // Pick a remaining element
          let randId = Math.floor(Math.random() * curId);
          curId -= 1;
          // Swap it with the current element.
          let tmp = array[curId];
          array[curId] = array[randId];
          array[randId] = tmp;
       }
       return array;
    }
    

    // Main DFS method 
    dfs(startingNode) 
    { 
        var visited = {}; 
        var walk = {order: new Array()};
      
        this.DFSUtil(startingNode, visited, walk, 5); 

        return walk;
    } 
      
    // Recursive function which process and explore 
    // all the adjacent vertex of the vertex with which it is called 
    DFSUtil(vert, visited, walk, limit) 
    { 
        visited[vert] = true; 
        var visited_size = Object.keys(visited).length;
 
        walk["order"].push(vert);
      
        var get_neighbours = this.AdjList.get(vert); 

        // FIXME: This shuffle should be weighted
        var neighbours = this.shuffleArray(get_neighbours);

        for (var i in neighbours) { 
            var get_elem = neighbours[i];
            if (!visited[get_elem] && visited_size < limit)  { // FIXME: This limit doesn't work yet
                this.DFSUtil(get_elem, visited, walk, limit); 
            }
        } 
    } 
} 

