function randomSort(a, b) {
  return Math.random();
}

function arrayRemove(arr, value) {
    return arr.filter(function(ele){
        return ele != value;
    });
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

function getLanguages() {
    // Creates the language selection dialogue
    console.log('getLanguages()');
    languageSelector = document.getElementById('languages');
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/get_languages');
    xhr.onload = function() {
        res = JSON.parse(xhr.responseText);
        languages = res["languages"];
        for(var i = 0; i < languages.length; i++) {
            var language = document.createElement("option");
            if(language_names[languages[i]]) { 
                var languageText = document.createTextNode(language_names[languages[i]]);
            } else {
                var languageText = document.createTextNode(languages[i]);
            }
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

// Above here should be moved to util.js but they are called in main()
/********************************************************************/

function main() {
    /* Loads all the js libraries and project modules, then calls onReady. */
    console.log('main()');
    head.js('/static/util.js');

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
    if(!localStorage.getItem('enableSearch')) {
        localStorage.setItem('enableSearch', true);
        eb = document.getElementById('enableSearch');
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
    var lang = localStorage.getItem('currentLanguage');
    var h = document.documentElement;
    if(lang == "ar" || lang == "fa" || lang == "dv") { // FIXME: be cleverer here
        // <html dir="rtl" lang="ar">
        h.setAttribute('dir', 'rtl');
    } else {
        h.setAttribute('dir', 'ltr');
    }
    h.setAttribute('lang', lang);

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

function updateTask(task) {
	/*
	 * On the top-right corner of the website, there are switches that toggle different task types.
	 * This function stores those task types, so that we know which are enabled and which aren't.
	 *
	 * Example invocation in the HTML:
	 *
	 *  <span class="cb"><input onClick="updateTask(this)" type="checkbox" id="enableBlanks" name="enableBlanks"><label for="enableBlanks">Blanks</label></span>
	 *
	 * So essentially we're doing here localStorage.setItem("enableBlanks", true); // (or false).
	 *
	 */
    localStorage.setItem(task.id, task.checked);
}


function userInputChoice(e, correct, tid) {
/** 
 * This function is called in the choice task, it checks to see if the user chose the correct option.
 * And then updates the spans with colours and disables the onClick event and redraws the feedback line
 * Example invocation in buildOptionTbox():
 *    onClick="userInputChoice(event, 1, \'t${i}'\)"                                                                        
 */
    console.log('userInputChoice:', e);
    console.log('tid:')
    console.log(tid);
    responses = localStorage.getItem('responses');
    answer = document.getElementById(tid);
    other = tid.charAt(0) === 'd' ? document.getElementById(tid.substr(1)) : document.getElementById('d' + tid);
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
/**
 * Checks to see if the user pressed 'Enter' 
 *
 * Used in the gap task to check for the user completing the task 
 */
    console.log('userInput:', e);
    console.log('tid:')
    console.log(tid);

    if(e.key == 'Enter') {
      checkInput(tid);
    }
}

function buildOptionTbox(current_text, gap, distractors) {
/**
 * Used in the choice task, it produces two spans one with the right answer and the other with a distractor
 * The order of the spans is chosen randomly
 * It modifies the casing of the distractors to match the correct choice
 * Words which are not selected as the target word are written out without a span
 * The whole thing is wrapped in a paragraph for spacing/layout reasons.
 * When one of the spans is clicked, userInputChoice() is called.
 */ 
    line = '';
    console.log('buildOptionTbox()')
    // FIXME: Caps at beginning of sentence
    console.log('distractors:')
    console.log(distractors);
    var distractor = distractors[0];
    for (var i = 0; i < current_text.length; i++) {
        if (i == gap) {
            if(i == 0) {
                distractor[0] = distractor[0].toUpperCase();
            } else {
                distractor = distractor.toLowerCase();
            } 
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
                                data-value="${current_text[i]}">${distractor}</span>}`

             } else {
                line += `{<span 
                                onClick="userInputChoice(event, 0, \'dt${i}'\)"
                                id="dt${i}"
                                style="border: thin dotted #000; width: ${current_text[i].length}ch"
                                data-value="${current_text[i]}">${distractor}</span>, 
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
/**
 *  This builds a text entry box for the text-gap task
 *  Goes through the text and either writes the input box (at the gap) or writes the text 
 *  Wraps it in a paragraph for spacing/layout reasons.
 */ 
    line = '';
    for (var i = 0; i < current_text.length; i++) {
        if (i == gap) {
            line += `<input type="text"
                            onKeyPress="userInput(event, \'t${i}'\)"
                            id="t${i}"
                            data-focus="true"
                            style="font-size: 110%; border: thin dotted #000; width: ${current_text[i].length}ch"
                            data-value="${current_text[i]}"/> `
        } else {
            line += current_text[i] + ' '
        }
    }
    line = '<p>' + line + ' </p>';
    return line;
}

function focusGap() {
/**
 * After the audio finishes playing we can focus the text entry box, so the user doesn't have to click on it 
 *
 */
    document.querySelectorAll('[data-focus="true"]')[0].focus();
}

function onReady() {
/** 
 * First it makes an array of the available tasks
 * Then it chooses a task and calls the relevant sub-onReady function.
 */
     
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
    var et = localStorage.getItem('enableSearch')
    if(et == "true") {
        console.log('4T? ' + localStorage.getItem('enableSearch'))
        enabledTasks.push("search");
    }

    var tasks = enabledTasks.join("|");
    var current_language = localStorage.getItem('currentLanguage')

    var questions = {};
    var player = document.getElementById('player');
    var source = document.getElementById('audioSource');
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/get_clips?nlevels=10&enabled='+tasks +'&level=' + current_level + '&language=' + current_language);
    xhr.onload = function() {
        var res = JSON.parse(xhr.responseText);
        var current_question = res["question"];
        var current_audio = current_question["path"];
        var current_text = current_question["tokenized"];
        var distractor = res["distractor"];
        console.log('distractor:');
        console.log(distractor);
        var task_type = res["task_type"];
        var gap = res["gap"];

        source.src = '/static/cv-corpus-6.1-2020-12-11/' + current_question['locale'] + '/clips/' + current_audio;
        source.type = 'audio/mp3';
        player.load();

        console.log('task_type: ' + task_type);
        if(task_type == "choice") {
            onReadyChoice(current_text, gap, distractor);
        } else if(task_type == "blank") {
            onReadyBlank(current_text, gap);
        } else if(task_type == "scramble") {
            onReadyScramble(current_text);
//        } else if(task_type == "search") {
//            onReadySearch(current_text, distractor);
        } else {
            console.log("TASK: not implemented, assigning blank");
            onReadyBlank(current_text, gap);
        }
    };
// General code starts here
    xhr.send();
}

function checkInputSearch(e) {
/**
 * This is for the searching task, which is select K words found in the audio from N words in total
 * It checks to see if the answer is correct or incorrect and sets the colour accordingly
 * Then it redraws the feedback.
 */ 
    console.log('checkInputSearch()');
    var res = e.target.getAttribute('data-value');
    if(res == "false") {
        e.target.setAttribute('class', 'wordGuess incorrect');
    } else {
        e.target.setAttribute('class', 'wordGuess correct');
    }

    clearFeedback();
    drawFeedback();
}

function onReadySearch(current_text, distractor) {
/**
 * Core task function for the 'Search' task
 * - Gets a question from the backend
 * - Makes 6 boxes (spans) where 3 are correct and three are incorrect
 * - The boxes are arranged randomly
 */
    console.log('onReadySearch()');

// Specific code starts here
    console.log('distractors:');
    console.log(distractor);
    console.log('current_text:');
    console.log(current_text);

        
    var tb = '';
    var replacements = current_text; 
    var allWords = Array();
    for(var i = 0; i < 3; i++) {
        // FIXME: We need an API change here, we need to be able to get more than one distractor
        var word = replacements[electGap(replacements, distractors, true)];
        replacements = arrayRemove(replacements, word);
        var tw = '<span onClick="checkInputSearch(event)" class="wordGuess" data-value="true">' + word.toLowerCase() + '</span>';
        var distractor = distractor[0];

        console.log('distractor:');
        console.log(distractor);
        var fw = '<span onClick="checkInputSearch(event)" class="wordGuess" data-value="false">' + distractor.toLowerCase() + '</span>';
        allWords.push(tw);
        allWords.push(fw);
    }
    allWords = allWords.sort(randomSort);
    for(var i = 0; i < allWords.length; i++) {
        tb += allWords[i] + ' ';
    }

    tbox = document.getElementById('textbox');

    tbox.innerHTML = tb;
}



function onReadyScramble(current_text) {
    /** 
     *	onReady function for the Scamble task
     *	- It gets a set of characters and randomises the order
     * - It creates tiles (spans) for each of the characters
     * - Creates slots for the tiles to be dragged into.
     */
    console.log('onReadyScramble()');

    tbox = document.getElementById('textbox');

// Specific code
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
        cb += '<span class="clue" onDragEnd="onScramEnd(event)" onDragStart="onScramStart(event)" draggable="true" data-value="'+arr1[i] +'">' + arr1[i].toLowerCase() + '</span>';
        cb += '<span style="color: white"> _ </span>';
    }
	console.log('set1:')
    console.log(set1);
    cbox.innerHTML = cb;
    tbox.innerHTML = tb;
}

function onScramOver(e) {
/**
 * Function called on the hover over for the tile dropping
 */
//    console.log('onScramOver()');
//    console.log(e);
//   e.currentTarget.style.backgroundColor = 'red';
    e.preventDefault();
}

function onScramStart(e) {
/**
 * When we start dragging a tile, we set its background colour to yellow.
 */
    console.log('onScramStart()');
    e.dataTransfer.setData('value', e.currentTarget.dataset.value);
   e.currentTarget.style.backgroundColor = 'yellow';
   console.log('e:')
    console.log(e);
}

function onScramEnd(e) {
/**
 * When we finish dragging we set the background colour back to white
 */
    console.log('onScramStart()');
  e.currentTarget.style.backgroundColor = '#bababa';
//   e.currentTarget.style.backgroundColor = 'white';
}

function onScramDrop(e, tid) {
/**
 * This is called when we drop the tile on a target
 * - We should check if the target and the tile match and update the colour
 * - This also merges those drop squares when the whole word is complete and sets the border to green
 * - It should also check to see if the whole response is right and update the responses as necessary
 */
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
        // Check if the word is complete here 
        tbox = document.getElementById('textbox');

        current_tokens = Array();
        target_tokens = Array();
        target_ids = Array();

        current_token = ""; // The token as it currently is
        target_token = ""; // The correct token
        target_id = Array(); // A list of span IDs that correspond to tokens, e.g. [[0,1], [2,3,4,5], [6,7]]
        for(var i = 0; i < tbox.children.length; i++) {
            // If we hit a word boundary
            if(tbox.children[i].getAttribute('data-target') == null) { 
                target_tokens.push(target_token);
                current_tokens.push(current_token);
                target_ids.push(target_id);
                target_token = "";
                current_token = "";
                target_id = Array();
                continue;
            }       
            // Build up the tokens
            target_token += tbox.children[i].getAttribute('data-target');
            target_id.push(tbox.children[i].getAttribute('id'));
            current_token += tbox.children[i].textContent;
            console.log('#' + i + ': ' + tbox.children[i].textContent + ' // ' + tbox.children[i].getAttribute('data-target'));
        }

        console.log('target_tokens:');
        console.log(target_tokens);
        console.log('target_ids:');
        console.log(target_ids);
        console.log('current_tokens:');
        console.log(current_tokens);
        var ncorrect = 0; // Number of tokens found as being correct
        for(var i = 0; i < target_tokens.length; i++) {
            // If the token matches
            if(target_tokens[i] == current_tokens[i]) {
                ncorrect += 1;
                for(var j = 1; j < target_ids[i].length; j++) {
                    toDelete = document.getElementById(target_ids[i][j]);
                    tbox.removeChild(toDelete);
                    //toDelete.setAttribute('style', 'display:none');
                }
                // Put a fancy green box around it
                wbox = document.getElementById(target_ids[i][0]);
                wbox.setAttribute("style", "border-radius: 5px; border: 2px solid green; padding: 5px;");
                wbox.setAttribute("class", "correct");
                wbox.innerHTML = target_tokens[i];
            }
        }
        // FIXME: Currently because we delete the nodes, the target tokens are never rebuilt
        // after they are correct, so we can't calculate ncorrect properly.
        console.log('XX: ' + ncorrect + ' || ' + target_tokens.length);
        if(ncorrect == target_tokens.length) {
            responses = localStorage.getItem('responses');
            responses += "+"; 
            localStorage.setItem('responses', responses);
            clearFeedback();
            drawFeedback();
        }
    } else {
        console.log('INCORRECT!');
    }
}


function checkInput(tid) {
/** 
 * This code checks to see if the user got the right input value in the gap task.
 * It subsequently marks the answer either as correct (in green)
 * or as incorrect (in red) and gives the correct answer (in green)
 * It also updates the localstorage responses with if the answer was correct or not.
 */
    console.log('checkInput() ' + tid);
    input = document.getElementById(tid);
    console.log("input: ", input)
    correct = input.getAttribute("data-value");
    console.log('input: ')
    console.log(input);
    console.log('input.value: ')
    console.log(input.value);
    guess = input.value;

    if(guess == '') {
        span.focus();
        return;
    }

    console.log('correct: ' + correct);
    console.log('guess: ' + guess);

    responses = localStorage.getItem('responses');

    console.log('responses: ');
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
    console.log('responses: ');
    console.log(responses);
    localStorage.setItem('responses', responses);
    clearFeedback();
    drawFeedback();
}


/*************************************************************************************/
// Refactored functions below here


function onReadyBlank(current_text, gap) {
    /**
     * Run the Blank task
     */
    console.log('onReadyBlanks()');
    var tbox = document.getElementById('textbox');
    tbox.innerHTML = buildTbox(current_text, gap);
}

function onReadyChoice(current_text, gap, distractors) {
    /**
     * Run the Choice task
     * buildOptionTbox() to build the text box with binary choice
     *
     */
    console.log('onReadyChoice()');
    tbox = document.getElementById('textbox');
    tbox.innerHTML = buildOptionTbox(current_text, gap, distractors);
}


window.onload = main;
