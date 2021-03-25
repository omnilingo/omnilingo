class ChoiceTask extends Task {

	constructor(question) {
		super(question);
	}

	cleanup() {
		console.log('[ChoiceTask] cleanup()');
	}

	matchCase(word, distractor) {
	/** 
	 * Matches the case of a distractor to the word it is intended to replace
	 */
		console.log('[ChoiceTask] matchCase() ' + word + ' ||| ' + distractor);
		if(word[0] == word[0].toUpperCase()) {
			var recasedDistractor = distractor[0].toUpperCase() + distractor.slice(1, distractor.length);
			return recasedDistractor;
		} else if(word[0] == word[0].toLowerCase()) {
			var recasedDistractor = distractor[0].toLowerCase() + distractor.slice(1, distractor.length);
			return recasedDistractor;
		} else {
			console.log('FAIL? ' + word + ' ||| ' + distractor);
			return distractor;
		}
	}

	checkInput(e, correct, tid) {
	/** 
	 * This function is called in the choice task, it checks to see if the user chose the correct option.
	 * And then updates the spans with colours and disables the onClick event and redraws the feedback line
	 * Example invocation in buildOptionTbox():
	 *    onClick="userInputChoice(event, 1, \'t${i}'\)"                                                                        
	 */
		var answer = document.getElementById(tid);
		var other = tid.charAt(0) === 'd' ? document.getElementById(tid.substr(1)) : document.getElementById('d' + tid);
		if(correct == 1) {
			console.log('CORRECT!');
			answer.setAttribute("class", "correct");
			this.complete = true;
		} else {
			console.log('INCORRECT!');
			answer.setAttribute("class", "incorrect");
			other.setAttribute("class", "correct");
		}
		answer.removeAttribute("onClick");
		other.removeAttribute("onClick");
		this.endTask();
	}


	buildChoiceTbox(gap) {
		var distractor = this.chooseDistractor(this.tokens[gap]);
		distractor = this.matchCase(this.tokens[gap], distractor);
		var line = "";
		for (var i = 0; i < this.tokens.length; i++) {
			if (i == gap) {
				line += "{";
				var correct = `<span 
							onClick="onUserInputChoice(event, 1, \'t${i}'\)"
							id="t${i}"
							class="choiceBox"
							style="width: ${this.tokens[i].length}ch"
							data-value="${this.tokens[i]}">${this.tokens[i]}</span>`;
				var incorrect = `<span 
							onClick="onUserInputChoice(event, 0, \'dt${i}'\)"
							id="dt${i}"
							class="choiceBox"
							style="width: ${this.tokens[i].length}ch"
							data-value="${this.tokens[i]}">${distractor}</span>`;
				if(getRandomInt(0, 1) == 1) {
					line += correct + "," + incorrect;
				} else {
					line += incorrect + "," + correct;
				}
				line += "}";
			} else {
				line += this.tokens[i] + ' '
			}
		}
		line = '<p>' + line + ' </p>';
		return line;
	}

	endTask() {
		console.log("[ChoiceTask] endTask()");
		this.setRunning(false);
		stopTimer();
	}

	chooseDistractor(token) {
		console.log("[ChoiceTask] chooseDistractor()");
			
		var distractorLocation = getRandomInt(0, this.distractors[token].length - 1);

		return this.distractors[token][distractorLocation][1];
		
	}

	chooseGap() {
	/**
	 *	We need to choose a gap that is not punctuation, so first
	 *	find all possible non-punctuation tokens that have distractors
	 *	and then choose one.
	 */
		console.log("[ChoiceTask] chooseGap()");

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
		var gapLocation = getRandomInt(0, wordTokenIds.length - 1);

		return wordTokenIds[gapLocation];
	}

	run = async() => {
		//console.log("[ChoiceTask] run()");

		await this.init();
			
		var gap = this.chooseGap();	

		var tbox = document.getElementById("textbox");
		tbox.innerHTML = this.buildChoiceTbox(gap);

		this.setRunning(true);
	}
}

