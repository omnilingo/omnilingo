function main() {
    /* Loads all the js libraries and project modules, then calls onReady. */
    console.log('main()');
    head.js();
    head.ready(onReady);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function electGap(current_text) {
    do {
        gapIndex = getRandomInt(0, current_text.length - 1);
    } while (current_text[gapIndex] == ".");
    return gapIndex;
}

function buildTbox(current_text) {
    spans = '';
    gap = electGap(current_text);
    for (var i = 0; i < current_text.length; i++) {
        if (i == gap) {

            spans += ' <span onBlur="checkInput(\'t' + i + '\');" id="t';
            spans += i + '" style="border-bottom: thin dotted #000000;" data-value="';
            spans += current_text[i] + '" contenteditable>' + '&nbsp;&nbsp;&nbsp;' + '</span> ';
        } else {
            spans += '<span>' + current_text[i] + '</span> '
        }
    }
    return spans;
}

function onReady() {
    var questions = {};
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) {
            return;
        }
        res = JSON.parse(xhr.responseText);
        current_question = res["questions"][0];
        current_audio = current_question["path"];
        current_text = current_question["tokenized"];
        var player = document.getElementById('player');
        var source = document.getElementById('audioSource');

        source.src = '/static/cv-corpus-6.1-2020-12-11/' + current_question['locale'] + '/clips/' + current_audio;
        source.type = 'audio/mp3';
        player.load();
        var tbox = document.getElementById('textbox');
        tbox.innerHTML = buildTbox(current_text);

    };
    xhr.open('GET', 'http://localhost:5001/get_clips');
    xhr.send();

}

function checkInput(tid) {
    console.log('checkInput() ' + tid);
    span = document.getElementById(tid);

    correct = span.getAttribute("data-value");
    guess = span.childNodes[0].textContent.replaceAll(/\s/g,'');
    guess = guess.trim();

    console.log('correct: ' + correct);
    console.log('guess: ' + guess);

    if (guess == correct) {
        console.log('CORRECT!');
        span.setAttribute("style", "color: green");
        if (span.childNodes.length != 1) {
            span.childNodes[1].remove();
        }
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

function httpGet(theUrl) {
    console.log('httpGet()' + theUrl);
    var xmlhttp;
    if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    } else { // code for IE6, IE5
        alert('This browser is not supported or has insufficient permissions.');
    }
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            return xmlhttp.responseText;
        }
    }
    xmlhttp.open("GET", theUrl, false);
    xmlhttp.send();
}

window.onload = main;
