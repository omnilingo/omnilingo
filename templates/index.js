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

function changeLevel(elem) {
   console.log('changeLevel: ' + elem.value);
   localStorage.setItem('currentLevel', elem.value);
   location.reload(); 
}

function userInput(e, tid) {
    console.log('userInput:', e);

    if(e.key == 'Enter') {
      checkInput(tid);
    }
}

function buildTbox(current_text) {
    spans = '';
    gap = electGap(current_text);
    for (var i = 0; i < current_text.length; i++) {
        if (i == gap) {

            spans += ' <span onKeyPress="userInput(event,\'t' + i + '\');"';
            spans += 'onBlur="checkInput(\'t' + i + '\');" id="t';
            spans += i + '" style="border: thin dotted #000000;" data-focus="true" data-value="';
            spans += current_text[i] + '" contenteditable>' + '&nbsp;&nbsp;&nbsp;' + '</span> ';
        } else {
            spans += '<span>' + current_text[i] + '</span> '
        }
    }
    return spans;
}

function globalKeyDown(e) {
    console.log('globalKeyDown() ' + e.key);

    if(e.key == 'Tab') {
      // Play and focus textbox
      console.log('TAB');
      var player = document.getElementById('player');
      player.play();
      span = document.querySelectorAll('[data-focus="true"]');
      console.log(span[0]);
      span[0].focus();
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
    xhr.open('GET', 'http://localhost:5001/get_clips?nlevels=10&level=' + current_level);
    xhr.send();

}

function checkInput(tid) {
    console.log('checkInput() ' + tid);
    span = document.getElementById(tid);

    correct = span.getAttribute("data-value");
    guess = span.childNodes[0].textContent.replaceAll(/\s/g,'');
    guess = guess.trim();

    if(guess == '') {
        span.focus();
        return;
    }

    console.log('correct: ' + correct);
    console.log('guess: ' + guess);

    if (guess == correct) {
        console.log('CORRECT!');
        span.setAttribute("style", "color: green");
        span.setAttribute("contenteditable", false);
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
    }
}

window.onload = main;
