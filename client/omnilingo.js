class OmniLingo {

	constructor () {
		console.log('OmniLingo()');
		this.level = 1;
		this.batchSize = 5;
		this.graph = new Graph(this.batchSize);
//		this.state = new State();
		this.enabledTasks = ["blank", "scramble"];
	}

	setup(url, language) {
		console.log('setup()');
		this.staticUrl = url;
		this.language = language;
		this.updateLevel();
	}

	getIndex() {	
		console.log('getIndex()');
		return this.index;
	}

	fetchIndex = async () => {
		console.log('fetchIndex() ' + this.language);

		const indexPromise = fetch(this.staticUrl + '/index/' + this.language);
		const index = await Promise.all([indexPromise]);
		const indexData = index.map(response => response.json());
		const allData = await Promise.all(indexData);

		console.log('allData:');
		console.log(allData);

		this.index = allData[0]["index"];
	}

	updateRemaining() {
		var remainingSpan = document.querySelectorAll('[id="remaining"]')[0];
		remainingSpan.innerHTML = (this.currentWalk.length + 1) + "/" + this.batchSize;
	}

	updateLevel() {
		var levelSpan = document.querySelectorAll('[id="level"]')[0];
		levelSpan.innerHTML = this.level;
	}

	getLevel() {
		return this.level;
	}

	setLevel(level) {

		this.level = level;
	}

	getCurrentBatch() {
		// get the batch
		console.log('getCurrentBatch()');
		var start = (this.level * this.batchSize) - this.batchSize;
		var end = this.level * this.batchSize;
		var batch = this.index.slice(start, end);
		console.log('  [range] ' + start + ':' +  end + ' -> ' + batch.length);
		return batch;
	}

	getRunningTask() {
		return this.currentTask;
	}


	submitTask() {
		console.log('submitTask()');
		if(this.currentTask) {
			var newTime = document.getElementById("seconds").innerHTML;
			console.log('  [newTime] ' + newTime);
			// FIXME: this is bad design
			this.graph.setWeight(this.currentTask.question.nodeId, Number(newTime));
		}
		this.nextTask();
	
	}

	nextTask() {
		console.log('nextTask()');

	 	resetTimer();

		if(this.currentTask && !this.currentTask.complete) {
			console.log('  [incomplete] ' + this.currentTask.question.nodeId);
			this.currentWalk.push(this.currentTask.question.nodeId);
		}
		var currentQuestionId = this.currentWalk.shift();
		this.updateRemaining();
		if(this.currentWalk.length == 0) {
			this.endBatch();
		}
		var currentQuestion = this.graph.getNode(currentQuestionId);
		var currentTaskType = currentQuestion.getRandomRemainingTask();

		this.currentTask = new BlankTask(currentQuestion);
		this.currentTask.run();
	}

	endBatch() { 
		console.log('=======================================================================');
		console.log('endBatch()');

		// Here we need to score the graph, submit the results to the log.

		var score = this.graph.getScore();
		var graphMin = this.graph.getTotalLength();

		console.log('  [score] ' + score + ' || ' + graphMin);

		// If the score is high enough we increment it
		// Then we getCurrentBatch() again
		if(score <= graphMin) {
			this.level += 1;
			this.updateLevel();
			var batch = this.getCurrentBatch();
			this.graph.fromIndex(this.language, batch, this.enabledTasks);
			console.log('  [new level] ' + this.level);
		}
		// Otherwise we can just call randomWalk() again and get the next task.
		this.currentWalk = this.graph.randomWalk();
		this.nextTask();
	}

	run() {
		console.log('run()');

		var batch = this.getCurrentBatch();
		this.graph.fromIndex(this.language, batch, this.enabledTasks);

		console.log('  [score] ' + this.graph.getScore());
		console.log('  [totalLength] ' + this.graph.getTotalLength());

		this.currentWalk = this.graph.randomWalk();
		this.nextTask();
	}
}
