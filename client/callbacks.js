/**
 *	callbacks.js
 *	This file contains callbacks that are defined in the index.html file,
 *	these should be prefixed with 'on'.
 */

const onChangeLanguage = async (elem) => {
	console.log('onChangeLanguage() ' + elem.value);
	var newLanguage = elem.value ;
	localStorage.setItem('currentLanguage', newLanguage);
	var index = document.indexes[newLanguage];
	var metaData = getLanguageMeta(index["meta"]);
	var acceptingChars = metaData["alternatives"];
	runLanguage(newLanguage, index["cids"], acceptingChars);
}

function onSkipButton() {
	console.log('onSkipButton()');

	document.omnilingo.nextTask();
}


function onDumpButton() {
	console.log('onDumpButton()');

	var currentQuestion = document.omnilingo.getRunningTask().question;
	document.omnilingo.deactivateQuestion(currentQuestion);
	document.omnilingo.submitTask();
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
	startTimer();
}

function onUserInput(e) {
	//console.log('onUserInput()');

	if(e.key == 'Enter') {
		document.omnilingo.getRunningTask().endTask();
	}
}

//function onStartTimer() {
	//console.log('onStartTimer()');
//	startTimer();
//}

function globalKeyDown(e) {
	//console.log('globalKeyDown() ' + e.key);

	if(e.key == 'Tab') {
		// Play and focus textbox
		console.log('  [TAB]');
	}
	if(e.key == ' ') {
		// Next clip
		console.log('  [SPACE]')
		var player = document.getElementById('player');
		player.play();
		//document.omnilingo.submitTask();
	}
	if(e.key == 'Enter') {
		var inputBox = document.querySelectorAll('[data-focus="true"]')[0];
		if(!inputBox) {
			document.omnilingo.submitTask();
			return;
		}

		var task = document.omnilingo.getRunningTask();
		task.endTask();
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

function onUserInputChoice(e, corr, tid) {
/**
 * This is called when we drop the tile on a target
 */
	console.log('onUserInputChoice()');

	var task = document.omnilingo.getRunningTask();
	task.checkInput(e, corr, tid);
}

function onCheckInputSearch(e) {

	console.log('onCheckInputSearch()');

	var task = document.omnilingo.getRunningTask();
	task.checkInput(e);
}

function onRecordButton(e) {
	recordIcon = document.getElementById("recordIcon");
	isRecording = recordIcon.classList.contains("fa-stop");
	recordIcon.classList.toggle("fa-stop");
	recordIcon.classList.toggle("fa-circle");
	
	if (!isRecording) {
		if (!document.audioRecorder) {
			return;
		}
		document.audioRecorder && document.audioRecorder.record();
	}
	else {
		if(!document.audioRecorder) {
			return;
		}
		document.audioRecorder.stop();
	}

}


function handlerStartUserMedia(stream) {
	console.log('handlerStartUserMedia');
	console.log('sampleRate:'+ document.audioContext.sampleRate);
	// MEDIA STREAM SOURCE -> ZERO GAIN >
	document._realAudioInput = document.audioContext.createMediaStreamSource(stream);
	document.audioRecorder = new Recorder(document._realAudioInput, blob => {
		var recorder = document.getElementById("recorder");
		recorder.blob = blob;
		recorder.src = URL.createObjectURL(blob);
		recorder.style.display = "block";
	});
}

function handlerErrorUserMedia(e) {
	console.log('No live audio input: ' + e);
}


function onLoadRecorder() {
	if(document.recorderLoaded)
		return;

	window.AudioContext = (
		window.AudioContext ||
		window.webkitAudioContext ||
		window.mozAudioContext
	);
	navigator.getUserMedia = ( 
		navigator.getUserMedia ||
		navigator.webkitGetUserMedia ||
		navigator.mozGetUserMedia ||
		navigator.msGetUserMedia
	);
	
	window.URL = window.URL || window.webkitURL;
	document.audioContext = new AudioContext;

	if (typeof navigator.mediaDevices.getUserMedia === 'undefined') {
		navigator.getUserMedia({
			video:false,
			audio: true
		}, handlerStartUserMedia, handlerErrorUserMedia);
	} else {
		navigator.mediaDevices.getUserMedia({
			audio: true
		}).then(handlerStartUserMedia).catch(handlerErrorUserMedia);
	}
	document.recorderLoaded = true;
}

function onRecordingSaveButton() {
	var link = document.createElement("a");
	link.href = document.getElementById("recorder").src;
	link.download = "omnilingo-recording.mp3";
	link.click();
}

async function onRecordingUploadButton() {
	const file = await document.ipfs.add({content: document.getElementById("recorder").blob});
	console.log("posted to ipfs: " + file.cid);
	//	var xhr = new XMLHttpRequest();
	//	xhr.addEventListener("load", async function() {
	//		const file = await document.ipfs.add({content: this.response});
	//		console.log("posted to ipfs: " + file.cid);
	//	});
	//	xhr.open("GET", document.getElementById("recorder").src);
	//	xhr.send();
}
