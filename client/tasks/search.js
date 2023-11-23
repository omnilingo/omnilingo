class SearchTask extends Task {

	constructor(question) {
		super(question);
	}

	endTask() {
		console.log("[SearchTask] endTask()");
		this.setRunning(false);
		stopTimer();
	}

	buildClues(validGaps) {
		console.log("[SearchTask] buildClues()");

		var boxes = [];
		for(var i = 0; i < validGaps.length; i++) {
			var token = this.tokens[i];
			boxes.push([token, true]);
			if(token in this.distractors && this.distractors[token].length > 0) {
				var distractorId = getRandomInt(0, this.distractors[token].length - 1);
				console.log('  [distractorId] ' + distractorId);
				var distractor = this.distractors[token][distractorId][1];
				boxes.push([distractor, false]);
			} else {
				console.log('  [invalidDistractor] ' + i);
			}
		}
		var buttons = shuffleArray(boxes);

		console.log("  [buttons]");
		console.log(buttons);

		this.totalClicks = 0;

		var cb = "";
		for(var i = 0; i < buttons.length; i++) {
			if(i % 3 == 0) {
				cb += "<br/><br/>";
			}
			if(buttons[i][1] == true) {
				this.totalClicks += 1; // This will be the max number of clicks allowed
			}
			cb += '<span onClick="onCheckInputSearch(event)" class="wordGuess" data-value="';
			cb += buttons[i][1] + '">' + buttons[i][0].toLowerCase();
			cb += '</span> ';
			if(i > 6) {
				break;
			}
		}

		return cb;
	}

	checkInput(e) {
		console.log("[SearchTask] checkInput() " + this.totalClicks);

		var res = e.target.getAttribute('data-value');
		if(res == "false") {
			e.target.setAttribute('class', 'wordGuessIncorrect');
		} else {
			e.target.setAttribute('class', 'wordGuessCorrect');
		}
		e.target.removeAttribute('onClick');

		this.totalClicks -= 1; // Each time the learner clicks we decrement this

		if(this.totalClicks == 0) {
			console.log('  [finished] ' + this.totalClicks);
		        var allRemaining = document.querySelectorAll('[class="wordGuess"]');
			console.log('  [allRemaining] ' + allRemaining.length);
			var remaining = allRemaining.length;
			for(var i = 0; i < allRemaining.length; i++) {
				allRemaining[i].removeAttribute('onClick');
				if(allRemaining[i].getAttribute('data-value') == "false") {
					remaining -= 1;
				}
			}

			console.log('  [remaining] ' + remaining);
			if(remaining == 0) {
				console.log('  [completed]');
				this.complete = true;
			}
			this.endTask();
		}
	}

	chooseGaps() {
	/**
	 *	We need to choose a gap that is not punctuation, so first
	 *	find all possible non-punctuation tokens that have distractors
	 *	and then choose one.
	 */
		console.log("[SearchTask] chooseGaps()");

		var wordTokenIds = [];
		for(var i = 0; i < this.tokens.length; i++) {
			var token = this.tokens[i];
			if(this.tags[i] == "PUNCT") {
				continue;
			}
			if(token in this.distractors && this.distractors[token].length > 0) {
				wordTokenIds.push(i);
			}
		}

		return wordTokenIds;
	}

	run = async() => {
		//console.log("[SearchTask] run()");

		await this.init();

		var gaps = this.chooseGaps();

		var cbox = document.getElementById('clues');
		cbox.innerHTML = '';
    cbox.append(this.buildClues(gaps), document.createElement('br'), document.createElement('br'));

		this.setRunning(true);
	}

}
