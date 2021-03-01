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

function buildTbox(current_text) {
    line = '';
    gap = electGap(current_text);
    for (var i = 0; i < current_text.length; i++) {
        if (i == gap) {
            line += ' <input onKeyPress="userInput(event,\'t' + i + '\')"; id="t';
            line += i + '" data-focus="true" data-value="" style="border: thin dotted #000000;"';
            line += ' /> '
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

function globalKeyDown(e) {
    console.log('globalKeyDown() ' + e.key);

    if(e.key == 'Tab') {
      // Play and focus textbox
      console.log('TAB');
      var player = document.getElementById('player');
      player.play();
      return;
    }
    if(e.key == ' ') {
      // Next clip
      location.reload();
    }
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
        tbox.innerHTML = buildTbox(current_text);

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
    feedback = document.getElementById('feedback');
    for(var i = 0; i < responses.length; i++) {
        t = document.createTextNode(' ');
        feedback.appendChild(t);
        if(responses[i] == '-') {
            t = document.createTextNode('✘');
        } else {
            t = document.createTextNode('✔');
        }
        feedback.appendChild(t);
    }
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
    console.log(correct);
    guess = span.childNodes[0].textContent.replaceAll(/\s/g,'');
    guess = guess.trim();

    if(guess == '') {
        span.focus();
        return;
    }

    console.log('correct: ' + correct);
    console.log('guess: ' + guess);

    responses = localStorage.getItem('responses');

    console.log(responses);
    if (guess.toLowerCase() == correct.toLowerCase()) {
        console.log('CORRECT!');
        span.setAttribute("style", "color: green");
        span.setAttribute("contenteditable", false);
        responses += "+";
//        if (span.childNodes.length != 1) {
//            span.childNodes[1].remove();
//        }
    } else {
        console.log('INCORRECT!');
        span.setAttribute("style", "color: red");
        span.setAttribute("contenteditable", false);
        var shouldBe = document.createElement("span");
        shouldBe.setAttribute("style", "color:green");
        var t = document.createTextNode(" [" + correct + "]");
        shouldBe.appendChild(t);
        span.appendChild(shouldBe);
        responses += "-";
    }
    console.log(responses);
    localStorage.setItem('responses', responses);
}

window.onload = main;
