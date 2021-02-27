function main() {
	/* Loads all the js libraries and project modules, then calls onReady. */
	// var pathRoot = './lib/';
	console.log('main()');
	head.js();
	head.ready(onReady);
}




function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function onReady() {
	console.log('onReady()');
	var questions = {};
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4){
			res = JSON.parse(xhr.responseText);
			console.log(res);
			console.log(res["questions"]);
			console.log(res["questions"][0]);
			current_question = res["questions"][0];
			current_audio = current_question["path"];
			current_text = current_question["tokenized"];
			//   res = httpGet('/static/cv-corpus-6.1-2020-12-11/fi/clips/common_voice_fi_23997016.mp3');
			var player = document.getElementById('player');
			var source = document.getElementById('audioSource');

			source.src = '/static/cv-corpus-6.1-2020-12-11/' + current_question['locale'] + '/clips/' + current_audio;
			source.type = 'audio/mp3';
			player.load();
			var tbox = document.getElementById('textbox');
			spans = ''
				gap = getRandomInt(0, current_text.length - 1);
			for(var i = 0; i < current_text.length; i++) {
				if(i == gap)  {

					//			$("#sent-" + row[0]).append('<span onBlur="checkInput(\''+tokenId+'\');" onKeyUp="userInput(\''+tokenId+'\');" id="token-' + tokenId + '" data-value="' + t + '" alt="' + t + '" contenteditable>' + t + '</span> ');

					spans += ' <span onBlur="checkInput(\'t'+i+'\');" id="t' + i + '" style="border-bottom: thin dotted #000000;" data-value="' + current_text[i] + '" contenteditable>' + '&nbsp;&nbsp;&nbsp;'  + '</span> '  
				} else {
					spans += ' <span>' + current_text[i] + '</span> '  
				}
			}
			tbox.innerHTML = spans;

		}
	};
	xhr.open('GET', 'http://localhost:5001/get_clips?nlevels=10&level=0');
	xhr.send();

}

function checkInput(tid) {
	console.log('checkInput() ' + tid);
	span = document.getElementById(tid);

	correct = span.getAttribute("data-value");
	guess = span.textContent;
	guess = guess.trim();

	console.log('correct: ' + correct);
	console.log('guess: ' + guess);

	if(guess == correct) {
             console.log('CORRECT!');
             span.setAttribute("style", "color: green");
	} else {
             console.log('INCORRECT!');
             span.setAttribute("style", "color: red");
             var shouldBe = document.createElement("span");
	     shouldBe.setAttribute("style", "color:green");
             var t = document.createTextNode(" [" + correct + "]");
             shouldBe.appendChild(t);
             span.appendChild(shouldBe);
	}
}

function parseText(text) {
	console.log(text);
}

function httpGet(theUrl) {
	console.log('httpGet()' + theUrl);
	var xmlhttp;
	if (window.XMLHttpRequest)
	{// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp=new XMLHttpRequest();
	}
	else
	{// code for IE6, IE5
		console.log('shit outta luck');
	}
	xmlhttp.onreadystatechange=function()
	{
		if (xmlhttp.readyState==4 && xmlhttp.status==200)
		{
			return xmlhttp.responseText;
			//parseText(xmlhttp.responseText);
		}
	}
	xmlhttp.open("GET", theUrl, false);
	xmlhttp.send();	
}


window.onload = main;

