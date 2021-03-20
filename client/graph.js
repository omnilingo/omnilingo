class Graph { 

	constructor(nodeCount) 
	{ 
		this.nodeCount = nodeCount; 
		this.Nodes = new Map(); 
		this.Weights = new Map(); 
		this.AdjList = new Map(); 
	}

	fromIndex(language, index, enabledTasks) {
		console.log('fromIndex() ' + index.length);
	
		for (var i = 0; i < index.length; i++) { 
			this.addNode(i, new Question(i, language, index[i], enabledTasks)); 
			this.setWeight(i, Number(index[i][2])); 
		} 
	
		for (var i = 0; i < index.length; i++) { 
			for (var j = 0; i < index.length; i++) { 
				this.addEdge(i, j);
			}
		}
	}

	getTotalLength() 
	{
		var length = 0.0;
		for(var i = 0; i < this.nodeCount; i++) {
			var node = this.getNode(i);
			length += Number(node.audioLength);
		}
		return length ;
	}

	getScore() 
	{
		var score = 0.0;
		for(var i = 0; i < this.nodeCount; i++) {
			score += this.getWeight(i);
		}
		return score;
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
	
	randomWalk() 
	{
		console.log('randomWalk()');
		return this.dfs(getRandomInt(0, this.nodeCount - 1));
	}

	// Main DFS method 
	dfs(startingNode) 
	{ 
		console.log('dfs() ' + startingNode);
		var visited = {}; 
		var walk = {order: new Array()};
	  
		this.DFSUtil(startingNode, visited, walk, 5); 
		
		console.log(walk["order"]);

		return walk["order"];
	} 
	  
	// Recursive function which process and explore 
	// all the adjacent vertex of the vertex with which it is called 
	DFSUtil(vert, visited, walk, limit) 
	{ 
		console.log('DFSUtil()');
		visited[vert] = true; 
		var visited_size = Object.keys(visited).length;
 
		walk["order"].push(vert);
	  
		var get_neighbours = this.AdjList.get(vert); 

		// FIXME: This shuffle should be weighted
		var neighbours = shuffleArray(get_neighbours);

		for (var i in neighbours) { 
			var get_elem = neighbours[i];
			if (!visited[get_elem] && visited_size < limit)  { // FIXME: This limit doesn't work yet
				this.DFSUtil(get_elem, visited, walk, limit); 
			}
		} 
	} 
} 

