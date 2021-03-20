/**
 *	callbacks.js
 *	This file contains callbacks that are defined in the index.html file,
 *	these should be prefixed with 'on'.
 */ 

function onChangeLanguage(elem) {
	console.log('onChangeLanguage() ' + elem.value);
	var newLanguage = elem.value ;
	localStorage.setItem('currentLanguage', newLanguage);
	runLanguage(newLanguage);
}

function onSkipButton() { 
	console.log('onSkipButton()');

	document.omnilingo.nextTask();
}


function onDumpButton() { 
	console.log('onDumpButton()');
}

function onSubmitButton() { 
	console.log('onSubmitButton()');

	// Get the current task

	// Check for task completeness 

	// If the task is complete and correct
	// then treat it as complete: 
	// - update the score
	// - set the task as completed


	// If the task is incomplete or incorrect, 
	// then treat it as a skip 

	document.omnilingo.submitTask();
	
}

function onPlayerFinish() {
/**
 * After the audio finishes playing we can focus the text entry box, so the user doesn't have to click on it 
 *
 */
	//console.log('onPlayerFinish()');
	// We check here because sometimes the user answers before the 
	// clip finishes, which removes the data-focus box
	var inputBox = document.querySelectorAll('[data-focus="true"]');
	if(inputBox[0]) {
		inputBox[0].focus();
	}
}

function onUserInput(e) { 
	//console.log('onUserInput()');
	
	if(e.key == 'Enter') {
		document.omnilingo.getRunningTask().endTask();
	}

}

function onStartTimer() {
	//console.log('onStartTimer()');
	startTimer();
}

function globalKeyDown(e) {
	//console.log('globalKeyDown() ' + e.key);

	if(e.key == 'Tab') {
		// Play and focus textbox
		console.log('  [TAB]');
		var player = document.getElementById('player');
		player.play();
	}
	if(e.key == ' ') {
		// Next clip
		console.log('  [SPACE]')
		document.omnilingo.submitTask();
	}
}

function onSourceClick(e) {
/**
 * When we click on a source tile
 */
	console.log('onSourceClick()');

	var task = document.omnilingo.getRunningTask();
	task.sourceClick(e);
}

function onTargetClick(e, tid) {
/**
 * This is called when we drop the tile on a target
 */
	console.log('onTargetClick()');

	var task = document.omnilingo.getRunningTask();
	task.targetClick(e, tid);
}



