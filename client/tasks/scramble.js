class ScrambleTask extends Task {

	constructor(question) {
		super(question);
	}

	endTask() {
		console.log("[ScrambleTask] endTask()");
		this.setRunning(false);
		stopTimer();
	}

	sourceClick(e) {
		console.log('[ScrambleTask] sourceClick()');
	        var clicked = e.target.getAttribute('data-clicked');
	        if(clicked) {
	                e.target.removeAttribute('data-clicked');
	                e.target.style.backgroundColor = '#bababa';
	        } else {
	                e.target.setAttribute('data-clicked', 'tile');
	                e.target.style.backgroundColor = 'yellow';
	        }
	}

	targetClick(e, tid) {
	/**
	 * This is called when we drop the tile on a target
	 * - We should check if the target and the tile match and update the colour
	 * - This also merges those drop squares when the whole word is complete and sets the border to green
	 * - It should also check to see if the whole response is right and update the responses as necessary
	 */
	
		var trg = e.target;
		var trg_val = trg.getAttribute('data-target');
		var dz = document.getElementById(tid);
		var src = document.querySelectorAll('[data-clicked="tile"]')[0];
		var src_val = src.getAttribute('data-value');
	
		console.log(' [src_val] ' + src_val + ' || [trg_val] ' + trg_val);
		
		if(src_val.toLowerCase() == trg_val.toLowerCase()) {
			console.log('  [correct] ' + src_val);
			this.correctClick(dz, trg_val);
		} else {
			this.incorrectClick(dz);
		}
		// FIXME: Do something with incorrect clicks here?
		src.removeAttribute('data-clicked');
		src.setAttribute('style', 'background-color:#bababa');

	}


	fancyBox(targetIds, targetToken) {
		console.log('[ScrambleTask] fancyBox()');
		for(var i = 1; i < targetIds.length; i++) {
			var toDelete = document.getElementById(targetIds[i]);
			//tbox.removeChild(toDelete);
			toDelete.setAttribute('style', 'display:none');
			toDelete.removeAttribute('data-target');
		}
		// Put a fancy green box around it
		var wbox = document.getElementById(targetIds[0]);
		wbox.setAttribute('data-target', targetToken);
		wbox.setAttribute("style", "border-radius: 5px; border: 2px solid green; padding: 5px;");
		wbox.setAttribute("class", "correct");
		wbox.innerHTML = targetToken;
	}

	correctClick(dz, trg_val) {
		console.log('[ScrambleTask] correctClick()');
		dz.innerHTML = trg_val;
		dz.setAttribute('class', 'correct targetBox');
		var tbox = document.getElementById('textbox');

		// Here we build up the token as it is currently to see if it is complete
		var targetToken = ""; // The correct token
		var currentToken = ""; // The token as it is
		var targetIds = Array();
		for(var i = 0; i < tbox.children.length; i++) {
			if(tbox.children[i].getAttribute('data-target') == null) {
				continue;
			}
			targetToken += tbox.children[i].getAttribute('data-target');
			currentToken += tbox.children[i].textContent;
			targetIds.push(tbox.children[i].getAttribute('id'));
		}
		
		console.log('  [targetToken] ' + targetToken + ' || [currentToken] ' + currentToken);

		if(targetToken.toLowerCase() == currentToken.toLowerCase()) {
			this.fancyBox(targetIds, targetToken);
			this.complete = true;
			this.endTask();
		}
	}	

	// FIXME: This code doesn't work, the idea is to do some animation when the user gets it wrong
	incorrectClick(dz) { 
		console.log('[ScrambleTask] incorrectClick()');	
		console.log(dz);
		dz.setAttribute('style', 'background-color: red; color: red');
		setTimeout(this.toggleIncorrect(dz), 3000);
	}
	
	toggleIncorrect(dz) {
		console.log('[ScrambleTask] toggleIncorrect()');	
		console.log(dz);
		dz.setAttribute('style', 'background-color: white');
	}

	buildTiles(gap) {
		
		var set1 = new Set(this.chars[gap]);
		var arr1 = Array.from(set1);
		arr1 = shuffleArray(arr1);

		var cb = "";
		for(var i = 0; i < arr1.length; i++) {
			if(arr1.length > 8 && i % (arr1.length/2) == 0) {
				// FIXME: do this properly
				cb += '<br/>';
				cb += '<br/>';
			}
			// FIXME: do this properly
			cb += '<span class="clue" onClick="onSourceClick(event)" data-value="'+arr1[i] +'">' + arr1[i].toLowerCase() + '</span>';
			cb += '<span style="color: white"> _ </span>';
		}
		return cb;
	}

	buildTargets(gap) {

		var tb = "";
		for(var i = 0; i < this.tokens.length; i++) {
		    // FIXME: do this properly
			if(i == gap) {	
				tb += "&nbsp;"
				for(var j = 0; j < this.chars[gap].length; j++) {
					tb += '<span id="dz'+j+'" class="targetBox" onClick="onTargetClick(event,\'dz'+j+'\')" data-target="'+this.chars[gap][j]+'"> ? </span>&thinsp;';
				}
			} else {
				tb += '&nbsp;<span>' + this.tokens[i] + '</span>&nbsp;';
			} 
		} 
		return tb;
	}

	chooseGap() {
	/**
	 *	We need to choose a gap that is not punctuation, so first
	 *	find all possible non-punctuation tokens and then choose one.
	 */
		//console.log("[ScrambleTask] chooseGap()");

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
		//console.log("[ScrambleTask] run()");

		await this.init();
			
		var gap = this.chooseGap();	

		var cbox = document.getElementById('clues');
		cbox.innerHTML = this.buildTiles(gap) + '<br/><br/>';

		var tbox = document.getElementById("textbox");
		tbox.innerHTML = this.buildTargets(gap);

		this.setRunning(true);
	}
}

