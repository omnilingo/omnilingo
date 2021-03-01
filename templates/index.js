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

    // This allows us to capture Enter, Tab, Space etc.
    window.onkeydown = globalKeyDown;

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


    head.ready(onReady);
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

function changeLevel(elem) {
   console.log('changeLevel: ' + elem.value);
   localStorage.setItem('currentLevel', elem.value);
   location.reload(); 
}

function userInputChoice(e, correct, tid) {
    console.log('userInputChoice:', e);
    console.log(tid);
    if(correct == 1) {
        console.log('CORRECT!');
    }

    // Check and colour here
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
    ds = distractors[current_text[gap]];
    console.log(ds);
    for (var i = 0; i < current_text.length; i++) {
        if (i == gap) {
            // Randomise the order here
            if(getRandomInt(0, 1) == 1) {
                line += `{<span 
                                onClick="userInputChoice(event, 1, \'t${i}'\)"
                                id="t${i}"
                                style="border: thin dotted #000; width: ${current_text[i].length}ch"
                                data-value="${current_text[i]}">${current_text[i]}</span>, 
                           <span 
                                onClick="userInputChoice(event, 0, \'t${i}'\)"
                                id="t${i}"
                                style="border: thin dotted #000; width: ${current_text[i].length}ch"
                                data-value="${current_text[i]}">${ds[0]}</span>}`

             } else {
                line += `{<span 
                                onClick="userInputChoice(event, 0, \'t${i}'\)"
                                id="t${i}"
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
        t = document.createTextNode(' ');
        padding.appendChild(t);
        feedback.appendChild(padding);
    }
}

function chooseTask(enabledTasks) {
    console.log(enabledTasks);
    if(enabledTasks.length == 1) {
        return enabledTasks[0];
    }
    task = getRandomInt(0, enabledTasks.length);
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

    taskType = chooseTask(enabledTasks);
    console.log('TT: ' + taskType);
    if(taskType == "choice") {
        onReadyChoice();
    } else if(taskType == "blank") {
        onReadyBlank();
    } else {
        console.log("TASK: not implemented");
    }
}

function onReadyChoice() {
    console.log('onReadyChoice()');

    var questions = {};
    var player = document.getElementById('player');
    var source = document.getElementById('audioSource');
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/get_clips?nlevels=10&type=choice&level=' + current_level);
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
    xhr.open('GET', '/get_clips?nlevels=10&type=blank&level=' + current_level);
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
