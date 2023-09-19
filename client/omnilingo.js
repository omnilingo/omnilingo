class OmniLingo {

	constructor () {
		console.log('OmniLingo()');
		this.level = 1;
		this.batchSize = 5;
		this.graph = new Graph(this.batchSize);
//		this.state = new State();
		//this.enabledTasks = ["blank", "scramble", "choice", "search"];
		this.enabledTasks = ["blank"];
		this.globalScore = 0;
		this.deactivatedQuestions = new Set();
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

	setup = async (language, cids) => {
		console.log('setup()');
		this.language = language;
		this.cids = cids;
		this.updateLevel();
	}

	getIndex() {
		console.log('getIndex()');
		return this.index;
	}

	deactivateQuestion(question) {
		console.log('deactiveQuestion() ' + question.nodeId + ' ||| global: ' + question.getGlobalIndexPos());
		this.deactivatedQuestions.add(question.getGlobalIndexPos());
		this.currentWalk = arrayRemove(this.currentWalk, question.nodeId);
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

		const allData = await Promise.all(this.cids.map(fetchIpfsJ));

		console.log('allData:');
		console.log(allData);
		// HACK: sometimes our data is just a string? parse it into json if so
		this.index = allData.map((x) => typeof x === "string" ? JSON.parse(x) : x).reduce((ac, x) => ac.concat(x)).sort(y => y["chars_sec"]);
	}

	updateRemaining() {
		var completed = this.batchSize - (this.currentWalk.length + 1);
		var remainingSpan = document.querySelectorAll('[id="remaining"]')[0];
		if(remainingSpan)
			remainingSpan.innerHTML = (this.currentWalk.length + 1) + "/" + this.batchSize;
		var feedbackDiv = document.querySelectorAll('[id="feedback"]')[0];
		if(feedbackDiv)
			feedbackDiv.innerHTML = '<div style="width: ' + (completed * 25) + '%" class="feedbackFill">&nbsp;</div>';
	}

	updateScore() {
		var scoreSpan = document.querySelectorAll('[id="score"]')[0];
		if(scoreSpan) {
			scoreSpan.innerHTML = this.globalScore.toFixed(2);
		}
	}


	removeLevelHighlight() {
		var levelSpan = document.querySelectorAll('[id="level"]')[0];
		if(levelSpan) {
			levelSpan.removeAttribute('data-highlighted');
			levelSpan.removeAttribute('style');
		}
	}


	setLevelHighlight() {
		var levelSpan = document.querySelectorAll('[id="level"]')[0];
		if(levelSpan) {
			levelSpan.setAttribute('style', 'border: 2px solid green; border-radius: 5px; background-color: #abcdab;');
			levelSpan.setAttribute('data-highlighted', 'true');
		}
	}

	updateLevel() {
		var levelSpan = document.querySelectorAll('[id="level"]')[0];
		if(levelSpan) {
			levelSpan.innerHTML = this.level;
			this.setLevelHighlight();
		}
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

		// FIXME: Should we start with the last ID of the previous question?
		var start = (this.level * this.batchSize) - this.batchSize;
		//var end = this.level * this.batchSize;
		//var batch = this.index.slice(start, end);

		console.log('  [deactivedQuestions] ' + this.deactivatedQuestions.size);

		var batch = [];
		var totalInBatch = 0;
		var totalDeactivatedQuestionsFound = 0;
		for(var i = start; i < this.index.length; i++) {
			if(this.deactivatedQuestions.has(i)) {
				totalDeactivatedQuestionsFound++;
				continue;
			}
			batch.push([this.index[i], i]);
			if(totalInBatch == this.batchSize - 1) {
				break;
			}
			totalInBatch++;
		}

		console.log('  [start] ' + start + ' / [deactivatedQuestionsFound] ' + totalDeactivatedQuestionsFound + ' / [end] ' + i);
		return batch;
	}

	getRunningTask() {
		return this.currentTask;
	}

	cleanup() {
		["clues", "textbox", "text"].forEach(e => {
			var x = document.getElementById(e);
			if(x)
				x.innerHTML = "";
		});
	}

	submitTask() {
		console.log('submitTask()');
		if(this.currentTask) {
			var newTime = document.getElementById("seconds").innerHTML;
			console.log('  [newTime] ' + newTime);
			// FIXME: this is bad design
			this.graph.setWeight(this.currentTask.question.nodeId, Number(newTime));
			this.cleanup();
		}
		this.removeLevelHighlight();
		this.nextTask();

	}

	nextTask() {
		console.log('nextTask()');
		console.log('  [currentWalk] ' + this.currentWalk.length)
		console.log(this.currentWalk)
		console.log('--------------');

		if(document.getElementById("seconds")) {
			stopTimer();
			resetTimer();
		}

		if(this.currentTask && !this.currentTask.complete) {
			console.log('  [incomplete] ' + this.currentTask.question.nodeId);
			this.cleanup();
			this.currentWalk.push(this.currentTask.question.nodeId);
		}
		var currentQuestion = null;
		do {
			var currentQuestionId = this.currentWalk.shift();
			this.updateRemaining();
			if(this.currentWalk.length < 1) {
				console.log('  [currentWalk] ' + this.currentWalk.length);
				this.endBatch();
			}
			var currentQuestion = this.graph.getNode(currentQuestionId);
		} while (!currentQuestion.sentenceCid)
		var currentTaskType = currentQuestion.getRandomRemainingTask();

		// FIXME: Do this nicer
		//var randInt = getRandomInt(0, 3);
		var randInt = 3;
		if(randInt == 0) {
			this.currentTask = new ScrambleTask(currentQuestion);
		} else if(randInt == 1) {
			this.currentTask = new ChoiceTask(currentQuestion);
		} else if(randInt == 2) {
			this.currentTask = new SearchTask(currentQuestion);
		} else {
			this.currentTask = new BlankTask(currentQuestion);
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

		this.cleanup();

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
