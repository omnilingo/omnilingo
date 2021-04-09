class BlankTask extends Task {

	constructor(question) {
		super(question);
	}

	cleanup() {
		console.log('[BlankTask] cleanup()');
	}

	buildTbox(gap) {
	/**
	 *  This builds a text entry box for the text-gap task
	 *  Goes through the text and either writes the input box (at the gap) or writes the text
	 *  Wraps it in a paragraph for spacing/layout reasons.
	 */
		//console.log("[BlankTask] buildTbox()");
		var line = "";
		var tbox = document.createElement("p");
		for (var i = 0; i < this.tokens.length; i++) {
			if (i == gap) {
				line += `<input type="text"
								onKeyPress="onUserInput(event)"
								data-focus="true"
								class="inputTextBox"
								style="width: ${this.tokens[i].length}ch"
								data-value="${this.tokens[i]}"/> `;
			} else {
				line += this.tokens[i] + " "
			}
		}
		line = "<p>" + line + " </p>";
		return line;
	}

	endTask() {
		console.log("[BlankTask] endTask()");
		this.setRunning(false);
		stopTimer();
		this.checkInput();
	}

	checkInput() {
	/**
	 * This code checks to see if the user got the right input value
	 * It subsequently marks the answer either as correct (in green)
	 * or as incorrect (in red) and gives the correct answer (in green)
	 */
		//console.log("[BlankTask] checkInput()");
		var inputBox = document.querySelectorAll('[data-focus="true"]')[0];
		var correctAnswer = inputBox.getAttribute("data-value");
		var guess = document.omnilingo.normaliseInput(inputBox.value);
		console.log(' [guess] ' + guess);
		if (guess.toLowerCase() == correctAnswer.toLowerCase()) {
			var answer = document.createElement("span");
			answer.setAttribute("class", "correct");
			var answerTextNode = document.createTextNode(correctAnswer + " ");
			answer.appendChild(answerTextNode);
			inputBox.parentNode.insertBefore(answer, inputBox.nextSibling);
			this.complete = true;
		} else {
			var shouldBe = document.createElement("span");
			shouldBe.setAttribute("style", "color: green");
			var correctTextNode = document.createTextNode(" [" + correctAnswer + "] ");
			shouldBe.appendChild(correctTextNode);
			inputBox.parentNode.insertBefore(shouldBe, inputBox.nextSibling);
			var incorrectAnswer = document.createElement("span");
			incorrectAnswer.setAttribute("style", "color: red");
			var incorrectTextNode = document.createTextNode(guess);
			incorrectAnswer.appendChild(incorrectTextNode);
			inputBox.parentNode.insertBefore(incorrectAnswer, inputBox.nextSibling);
		}
		inputBox.remove();
	}

	chooseGap() {
	/**
	 *	We need to choose a gap that is not punctuation, so first
	 *	find all possible non-punctuation tokens and then choose one.
	 */
		//console.log("[BlankTask] chooseGap()");

		var wordTokenIds = [];
		for(var i = 0; i < this.tokens.length; i++) {
			if(this.tags[i] != "PUNCT") {
				wordTokenIds.push(i);
			}
		}
		var gapLocation = getRandomInt(0, wordTokenIds.length -1);

		return wordTokenIds[gapLocation];
	}

	run = async() => {
		//console.log("[BlankTask] run()");

		await this.init();

		var gap = this.chooseGap();

		var tbox = document.getElementById("textbox");
		tbox.innerHTML = this.buildTbox(gap);

		this.setRunning(true);
	}
}
