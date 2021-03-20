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
	localStorage.removeItem('refreshIntervalId');
}

function startTimer() {
	console.log('startTimer()');
	var interval = localStorage.getItem('refreshIntervalId');
	console.log('  [interval] ' + interval);
	if(interval) {
		return;
	}
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

function shuffleArray(array) 
{
   let curId = array.length;
   // There remain elements to shuffle
   while (0 !== curId) {
	  // Pick a remaining element
	  let randId = Math.floor(Math.random() * curId);
	  curId -= 1;
	  // Swap it with the current element.
	  let tmp = array[curId];
	  array[curId] = array[randId];
	  array[randId] = tmp;
   }
   return array;
}

function findGetParameter(parameterName) {
	console.log('findGetParameter() ' + parameterName);
	var result = null,
	tmp = [];
	var items = location.search.substr(1).split("&");
	for (var index = 0; index < items.length; index++) {
		tmp = items[index].split("=");
		if (tmp[0] === parameterName) {
			result = decodeURIComponent(tmp[1]);
		}
	}
	return result;
}
