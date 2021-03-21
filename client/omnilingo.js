class OmniLingo {

	constructor () {
		console.log('OmniLingo()');
		this.level = 1;
		this.batchSize = 5;
		this.graph = new Graph(this.batchSize);
//		this.state = new State();
		this.enabledTasks = ["blank", "scramble"];
		this.globalScore = 0;
	}

	normaliseInput(s) {
		console.log('normaliseInput() ' + s);
		var normStr = ""
		for(var i = 0; i < s.length; i++) {
			var ch = s[i];
			if(this.equivalentChars.has(ch)) {
				normStr += this.equivalentChars.get(ch);
			} else {
				normStr += ch;
			}
		}
		return normStr;
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

	setEquivalentChars(acceptingChars) { 
		console.log('setEquivalentChars()');
		this.equivalentChars = new Map();
		for(var i in acceptingChars) {
			for(var j = 0; j < acceptingChars[i].length; j++) {
				this.equivalentChars.set(acceptingChars[i][j], i);
			}
		}
		console.log(this.equivalentChars);
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
		var completed = this.batchSize - (this.currentWalk.length + 1);
		var remainingSpan = document.querySelectorAll('[id="remaining"]')[0];
		remainingSpan.innerHTML = (this.currentWalk.length + 1) + "/" + this.batchSize;
		var feedbackDiv = document.querySelectorAll('[id="feedback"]')[0];
		feedbackDiv.innerHTML = '<div style="width: ' + (completed * 20) + '%" class="feedbackFill">&nbsp;</div>';
	}

	updateScore() {
		var scoreSpan = document.querySelectorAll('[id="score"]')[0];
		scoreSpan.innerHTML = this.globalScore.toFixed(2);
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
			this.currentTask.cleanup();
		}
		this.nextTask();
	
	}

	nextTask() {
		console.log('nextTask()');
		console.log('  [currentWalk] ' + this.currentWalk.length)
		console.log(this.currentWalk)
		console.log('--------------');

	 	stopTimer();
	 	resetTimer();

		if(this.currentTask && !this.currentTask.complete) {
			console.log('  [incomplete] ' + this.currentTask.question.nodeId);
			this.currentTask.cleanup();
			this.currentWalk.push(this.currentTask.question.nodeId);
		}
		var currentQuestionId = this.currentWalk.shift();
		this.updateRemaining();
		if(this.currentWalk.length < 1) {
			console.log('  [currentWalk] ' + this.currentWalk.length);
			this.endBatch();
		}
		var currentQuestion = this.graph.getNode(currentQuestionId);
		var currentTaskType = currentQuestion.getRandomRemainingTask();

		if(getRandomInt(0, 1) == 0) {
			this.currentTask = new BlankTask(currentQuestion);
		} else {
			this.currentTask = new ScrambleTask(currentQuestion);
		}
		this.currentTask.run();
	}

	endBatch() { 
		console.log('=======================================================================');
		console.log('endBatch()');

		// Here we need to score the graph, submit the results to the log.

		var score = this.graph.getScore();
		var graphMin = this.graph.getTotalLength();

		console.log('  [score] ' + score + ' || ' + graphMin);

		this.currentTask.cleanup();

		// If the score is high enough we increment it
		// Then we getCurrentBatch() again
		if(score <= graphMin) {
			// This is a simple way to calculate the score, 
			// but perhaps it should be multiplied by the level so there is 
			// more reward the higher the level
			this.globalScore += (graphMin - score);
			this.level += 1;
			this.updateLevel();
			this.updateScore();
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
