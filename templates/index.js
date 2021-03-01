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
    } while (current_text[gapIndex] == "." || current_text[gapIndex] == ":" || current_text[gapIndex] == "?" || current_text[gapIndex] == "," || current_text[gapIndex] == "!");
    // Do something better here for any punctuation
    return gapIndex;
}

function changeLevel(elem) {
   console.log('changeLevel: ' + elem.value);
   localStorage.setItem('currentLevel', elem.value);
   location.reload(); 
}

function userInput(e, tid) {
    console.log('userInput:', e);
    console.log(tid);

    if(e.key == 'Enter') {
      checkInput(tid);
    }
}

function buildTbox(current_text, gap) {
    line = '';
    for (var i = 0; i < current_text.length; i++) {
        if (i == gap) {
            line += `<input type="text"
                            onKeyPress="userInput(event, \'t${i}'\)"
                            id="t${i}"
                            data-focus="true"
                            style="border: thin dotted #000; width: ${current_text[i].length}ch"
                            data-value="${current_text[i]}"/> `
        } else {
            line += current_text[i] + ' '
        }
    }
    line = '<p>' + line + ' </p>';
    return line;
}

function focusGap() {
    document.querySelectorAll('[data-focus="true"]')[0].focus();
}

function focusGap() {
    span = document.querySelectorAll('[data-focus="true"]')[0]
    console.log(span);
    span.focus();
}

function globalKeyDown(e) {
    console.log('globalKeyDown() ' + e.key);

    if(e.key == 'Tab') {
      // Play and focus textbox
      console.log('TAB');
      var player = document.getElementById('player');
      player.play();
    }
    if(e.key == ' ') {
      // Next clip
      location.reload();
    }
}

function clearFeedback() {
    console.log('clearFeedback()');
    var myNode = document.getElementById("feedback");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
}

function drawFeedback() {
    feedback = document.getElementById('feedback');
    responses = localStorage.getItem('responses');
    console.log('drawFeedback() ' + responses);
    for(var i = 0; i < 10; i++) {
        span = document.createElement('span');
        if(responses[i] == '-') {
            t = document.createTextNode(' ✘ ');
            span.setAttribute("style", "padding:2px;align:center;color:red; border: 1px solid black");
            span.appendChild(t);
        } else if(responses[i] == '+') {
            t = document.createTextNode(' ✔ ');
            span.setAttribute("style", "padding:2px;align:center;color:green; border: 1px solid black");
            span.appendChild(t);
        } else {
            t = document.createTextNode(' ? ');
            span.setAttribute("style", "padding:2px;align:center;color:white; border: 1px solid black");
            span.appendChild(t);
        }
        feedback.appendChild(span);
        padding = document.createElement('span');
        t = document.createTextNode(' ');
        padding.appendChild(t);
        feedback.appendChild(padding);
    }
}


function getDistractors(word) {
    console.log('getDistractors() ' + word);
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) {
            return;
        }
        var res = JSON.parse(xhr.responseText);
        console.log('D:' + res["distractors"]);
        return res["distractors"];
    }
    xhr.open('GET', '/get_distractors?count=10&language=fi&word=' + word);
    xhr.send();
}

function onReady() {
    window.onkeydown = globalKeyDown;

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
        var gap = electGap(current_text);
        var distractors = getDistractors(current_text[gap]);
        console.log('D2:' + distractors);
        tbox.innerHTML = buildTbox(current_text, gap);

    };
    if(!localStorage.getItem('currentLevel')) {
        localStorage.setItem('currentLevel', 1);
    }
    if(!localStorage.getItem('responses')) {
        localStorage.setItem('responses', Array());
    }
    responses = localStorage.getItem('responses');
    console.log('RESPONSES: ' + responses);
    current_level = localStorage.getItem('currentLevel');
    levels = document.getElementById('levels');
    for(var i = 0; i < 10; i++) {
        var level = document.createElement("option");
        var levelText = document.createTextNode(i+1);
        if(i+ 1 == current_level) {
            level.setAttribute("selected","");
        }
        level.setAttribute("value", i+1);
        level.appendChild(levelText);
        levels.appendChild(level);
    } 
    drawFeedback();
    if(responses.length == 10) {
        localStorage.setItem('responses', Array());
    }
    xhr.open('GET', '/get_clips?nlevels=10&level=' + current_level);
    xhr.send();

}

function checkInput(tid) {
    console.log('checkInput() ' + tid);
    input = document.getElementById(tid);
    console.log("input: ", input)
    correct = input.getAttribute("data-value");
    console.log(input);
    console.log(input.value);
    guess = input.value;

    if(guess == '') {
        span.focus();
        return;
    }

    console.log('correct: ' + correct);
    console.log('guess: ' + guess);

    responses = localStorage.getItem('responses');

    console.log(responses);
    if (guess.toLowerCase() == correct.toLowerCase()) {
        var answer = document.createElement("span");
        answer.setAttribute("style", "color: green");
        var answerTextNode = document.createTextNode(correct + " ");
        answer.appendChild(answerTextNode);
        input.parentNode.insertBefore(answer, input.nextSibling);
        input.remove();
        responses += "+";
//        if (span.childNodes.length != 1) {
//            span.childNodes[1].remove();
//        }
    } else {
        var shouldBe = document.createElement("span");
        shouldBe.setAttribute("style", "color: green");
        var correctTextNode = document.createTextNode(" [" + correct + "] ");
        shouldBe.appendChild(correctTextNode);
        input.parentNode.insertBefore(shouldBe, input.nextSibling);

        console.log('INCORRECT!');
        var incorrectAnswer = document.createElement("span");
        incorrectAnswer.setAttribute("style", "color: red");
        var incorrectTextNode = document.createTextNode(guess);
        incorrectAnswer.appendChild(incorrectTextNode);
        input.parentNode.insertBefore(incorrectAnswer, input.nextSibling);

        input.remove();

        responses += "-";
    }
    console.log(responses);
    localStorage.setItem('responses', responses);
    clearFeedback();
    drawFeedback();
}

window.onload = main;
