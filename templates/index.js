function main() {
    /* Loads all the js libraries and project modules, then calls onReady. */
    console.log('main()');
    head.js();

    // For the first page load we set both tasks to enabled
    if(!localStorage.getItem('enableBlanks')) {
        localStorage.setItem('enableBlanks', true);
        eb = document.getElementById('enableBlanks');
        eb.setAttribute('checked', true);
    }
    if(!localStorage.getItem('enableChoice')) {
        localStorage.setItem('enableChoice', true);
        eb = document.getElementById('enableChoice');
        eb.setAttribute('checked', true);
    }
    if(!localStorage.getItem('enableScrams')) {
        localStorage.setItem('enableScrams', true);
        eb = document.getElementById('enableScrams');
        eb.setAttribute('checked', true);
    }


    // This allows us to capture Enter, Tab, Space etc.
    window.onkeydown = globalKeyDown;

    if(!localStorage.getItem('currentLevel')) {
        localStorage.setItem('currentLevel', 1);
    }

    if(!localStorage.getItem('currentLanguage')) {
        localStorage.setItem('currentLanguage', 'fi');
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
        if(i+1 == current_level) {
            level.setAttribute("selected","");
        }
        level.setAttribute("value", i+1);
        level.appendChild(levelText);
        levels.appendChild(level);
    } 

    getLanguages(); 

    drawFeedback();
    if(responses.length == 10) {
        localStorage.setItem('responses', Array());
    }


    head.ready(onReady);
}

function getLanguages() {
    console.log('onReadyChoice()');
    languageSelector = document.getElementById('languages');
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/get_languages');
    xhr.onload = function() {
        res = JSON.parse(xhr.responseText);
        languages = res["languages"];
        for(var i = 0; i < languages.length; i++) {
            var language = document.createElement("option");
            var languageText = document.createTextNode(languages[i]);
            if(localStorage.getItem('currentLanguage') == languages[i]) {
                language.setAttribute("selected","");
            }
            language.setAttribute("value", languages[i]);
            language.appendChild(languageText);
            languageSelector.appendChild(language);
        } 
    };
    xhr.send();
}



function updateTask(task) {
    // Update the state of the two check boxes
    localStorage.setItem(task.id, task.checked);
}

function getRandomInt(min, max) {
    // Generate a pseudo-random integer between min and max
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function electGap(current_text) {
    // Choose which index to gap out
    do {
        gapIndex = getRandomInt(0, current_text.length - 1);
    } while (current_text[gapIndex] == "." || current_text[gapIndex] == ":" || current_text[gapIndex] == "?" || current_text[gapIndex] == "," || current_text[gapIndex] == "!");
    // Do something better here for any punctuation
    return gapIndex;
}

function changeLanguage(elem) {
   console.log('changeLanguage: ' + elem.value);
   localStorage.setItem('currentLanguage', elem.value);
   localStorage.setItem('responses', Array());
   location.reload(); 
}


function changeLevel(elem) {
   console.log('changeLevel: ' + elem.value);
   localStorage.setItem('currentLevel', elem.value);
   location.reload(); 
}

function userInputChoice(e, correct, tid) {
    console.log('userInputChoice:', e);
    console.log(tid);
    responses = localStorage.getItem('responses');
    answer = document.getElementById(tid);
    other = document.getElementById("d" + tid);
    if(correct == 1) {
        console.log('CORRECT!');
        answer.setAttribute("class", "correct");
        responses += "+";
    } else {
        console.log('INCORRECT!');
        answer.setAttribute("class", "incorrect");
        other.setAttribute("class", "correct");
        responses += "-";
    }
    answer.removeAttribute("onClick");
    other.removeAttribute("onClick");
    localStorage.setItem('responses', responses);
    clearFeedback();
    drawFeedback();
}

function userInput(e, tid) {
    console.log('userInput:', e);
    console.log(tid);

    if(e.key == 'Enter') {
      checkInput(tid);
    }
}

function buildOptionTbox(current_text, gap, distractors) {
    line = '';
    console.log('buildOptionTbox()')
    // FIXME: Caps at beginning of sentence
    ds = distractors[current_text[gap]];
    console.log(ds);
    for (var i = 0; i < current_text.length; i++) {
        if (i == gap) {
            if(getRandomInt(0, 1) == 1) {
                line += `{<span 
                                onClick="userInputChoice(event, 1, \'t${i}'\)"
                                id="t${i}"
                                style="border: thin dotted #000; width: ${current_text[i].length}ch"
                                data-value="${current_text[i]}">${current_text[i]}</span>, 
                           <span 
                                onClick="userInputChoice(event, 0, \'dt${i}'\)"
                                id="dt${i}"
                                style="border: thin dotted #000; width: ${current_text[i].length}ch"
                                data-value="${current_text[i]}">${ds[0]}</span>}`

             } else {
                line += `{<span 
                                onClick="userInputChoice(event, 0, \'dt${i}'\)"
                                id="dt${i}"
                                style="border: thin dotted #000; width: ${current_text[i].length}ch"
                                data-value="${current_text[i]}">${ds[0]}</span>, 
                           <span 
                                onClick="userInputChoice(event, 1, \'t${i}'\)"
                                id="t${i}"
                                style="border: thin dotted #000; width: ${current_text[i].length}ch"
                                data-value="${current_text[i]}">${current_text[i]}</span>}`
             }


        } else {
            line += current_text[i] + ' '
        }
    }
    line = '<p>' + line + ' </p>';
    return line;
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
    // Focus the input box that is a gap
    document.querySelectorAll('[data-focus="true"]')[0].focus();
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
        padding.setAttribute('style', 'width: 20px');
        t = document.createTextNode(' ');
        padding.appendChild(t);
        feedback.appendChild(padding);
    }
}

function chooseTask(enabledTasks) {
    console.log(enabledTasks);
    console.log(enabledTasks.length);
    if(enabledTasks.length == 1) {
        return enabledTasks[0];
    }
    task = getRandomInt(0, enabledTasks.length-1);
    return enabledTasks[task];
}

function onReady() {
    // Here we choose a global task 
     
    var enabledTasks = Array();
    var et = localStorage.getItem('enableChoice')
    // FIXME: This is horrible, why doesn't javascript allow if(et) or a tonne of better things?
    if(et == "true") {
        console.log('1T? ' + localStorage.getItem('enableChoice'))
        enabledTasks.push("choice");
    }
    var et = localStorage.getItem('enableBlanks')
    if(et == "true") {
        console.log('2T? ' + localStorage.getItem('enableBlanks'))
        enabledTasks.push("blank");
    }
    var et = localStorage.getItem('enableScrams')
    if(et == "true") {
        console.log('3T? ' + localStorage.getItem('enableScrams'))
        enabledTasks.push("scramble");
    }


    taskType = chooseTask(enabledTasks);
    console.log('TT: ' + taskType);
    if(taskType == "choice") {
        onReadyChoice();
    } else if(taskType == "blank") {
        onReadyBlank();
    } else if(taskType == "scramble") {
        onReadyScramble();
    } else {
        console.log("TASK: not implemented, assigning blank");
        onReadyBlank();
    }
}

function onReadyScramble() {
    console.log('onReadyScramble()');

    var questions = {};
    var player = document.getElementById('player');
    var source = document.getElementById('audioSource');
    var xhr = new XMLHttpRequest();
    var current_language = localStorage.getItem('currentLanguage')
    xhr.open('GET', '/get_clips?nlevels=10&type=scramble&sorting=length&level=' + current_level + '&language=' + current_language);
    xhr.onload = function() {
        res = JSON.parse(xhr.responseText);
        current_question = res["questions"][0];
        current_audio = current_question["path"];
        current_text = current_question["tokenized"];

        source.src = '/static/cv-corpus-6.1-2020-12-11/' + current_question['locale'] + '/clips/' + current_audio;
        source.type = 'audio/mp3';
        player.load();
        tbox = document.getElementById('textbox');
        chars = Array();
        for(var i = 0; i < current_text.length; i++) {
            for(var j = 0; j < current_text[i].length; j++) {
              chars.push(current_text[i][j]);
            }
            chars.push(" ");
        }
        tb = "";
        for(var i = 0; i < chars.length; i++) {
            if(chars[i] == " ") {
              tb += '<span style="color: white"> _ </span>';
            } else {
              tb += '<span id="dz'+i+'" style="padding: 2px; text-align:center; border: 2px solid black" onDrop="onScramDrop(event,\'dz'+i+'\')" onDragOver="onScramOver(event)" data-target="'+chars[i]+'"> ? </span>';
            } 

        } 
        cbox = document.getElementById('clues');
        var set1 = new Set(chars);
        var arr1 = Array.from(set1);
        arr1 = shuffleArray(arr1);
        cb = "";
        for(var i = 0; i < arr1.length; i++) {
            if(arr1[i] == " ") {
                continue;
            }
            cb += '<span class="clue" onDragEnd="onScramEnd(event)" onDragStart="onScramStart(event)" draggable="true" data-value="'+arr1[i] +'">' + arr1[i] + '</span>';
            cb += '<span style="color: white"> _ </span>';
        }
        console.log(set1);
        cbox.innerHTML = cb;
        tbox.innerHTML = tb;
    };
    xhr.send();
}

function shuffleArray(array) {
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

function onScramOver(e) {
//    console.log('onScramOver()');
//    console.log(e);
    e.preventDefault();
}

function onScramStart(e) {
    console.log('onScramStart()');
    e.dataTransfer.setData('value', e.currentTarget.dataset.value);
   e.currentTarget.style.backgroundColor = 'yellow';
    console.log(e);
}

function onScramEnd(e) {
  e.currentTarget.style.backgroundColor = '#bababa';
}

function onScramDrop(e, tid) {
    console.log('onScramDrop()');
    console.log('tid:' + tid);
    let val = e.dataTransfer.getData('value');
    dz = document.getElementById(tid);
    let trg = dz.getAttribute('data-target');
    console.log('dz:' + dz);
    console.log('value:' + val);
    console.log('target:' + trg);

    if(val == trg) {
        console.log('CORRECT!');
        dz.innerHTML = val;
        dz.setAttribute('class', 'correct');
    } else {
        console.log('INCORRECT!');
    }
}

function onReadyChoice() {
    console.log('onReadyChoice()');

    var questions = {};
    var player = document.getElementById('player');
    var source = document.getElementById('audioSource');
    var xhr = new XMLHttpRequest();
    var current_language = localStorage.getItem('currentLanguage')
    xhr.open('GET', '/get_clips?nlevels=10&type=choice&level=' + current_level + '&language=' + current_language);
    xhr.onload = function() {
        res = JSON.parse(xhr.responseText);
        current_question = res["questions"][0];
        current_audio = current_question["path"];
        current_text = current_question["tokenized"];
        distractors = res["distractors"];
        source.src = '/static/cv-corpus-6.1-2020-12-11/' + current_question['locale'] + '/clips/' + current_audio;
        source.type = 'audio/mp3';
        player.load();
        tbox = document.getElementById('textbox');
        gap = electGap(current_text);
        tbox.innerHTML = buildOptionTbox(current_text, gap, distractors);
    };
    xhr.send();
}

function onReadyBlank() {
    console.log('onReadyBlanks()');

    var questions = {};
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
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
        tbox.innerHTML = buildTbox(current_text, gap);

    };
    current_language = localStorage.getItem('currentLanguage')
    xhr.open('GET', '/get_clips?nlevels=10&type=blank&level=' + current_level + '&language=' + current_language);
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
        answer.setAttribute("class", "correct");
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
