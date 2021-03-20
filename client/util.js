function getRandomInt(min, max) {
	// Generate a pseudo-random integer between min and max
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function hashToPath(hash) {
	// Do the part where we make a better directory structure
	return hash.slice(0,2) + '/' + hash.slice(2,6) + '/' + hash;
}

function stopTimer() {
	clearInterval(localStorage.getItem('refreshIntervalId'));
}

function startTimer() {
	console.log('startTimer()');
	var sec = 0;
	var res = setInterval( function(){
		document.getElementById("seconds").innerHTML = ++sec;
	}, 1000);
	localStorage.setItem('refreshIntervalId', res);
}

function resetTimer() {
	console.log('resetTimer()');
	document.getElementById("seconds").innerHTML = "0";
}
