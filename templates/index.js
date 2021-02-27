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
        current_text = current_question["sentence"];
//   res = httpGet('/static/cv-corpus-6.1-2020-12-11/fi/clips/common_voice_fi_23997016.mp3');
   var player = document.getElementById('player');
   var source = document.getElementById('audioSource');

   source.src = 'http://localhost:5001/static/cv-corpus-6.1-2020-12-11/fi/clips/' + current_audio;
   source.type = 'audio/mp3';
   player.load();
   var tbox = document.getElementById('textbox');
   spans = ''
   gap = getRandomInt(0, current_question["sentence"].length - 1);
   for(var i = 0; i < current_question["sentence"].length; i++) {
     if(i == gap)  {
     spans += ' <span data-word="' + current_question["sentence"][i] + '">' + '___' + '</span> '  
     } else {
     spans += ' <span>' + current_question["sentence"][i] + '</span> '  
     }
   }
   tbox.innerHTML = spans;

    }
};
xhr.open('GET', 'http://localhost:5001/get_clips');
xhr.send();

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

