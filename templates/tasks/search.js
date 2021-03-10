function onReadySearch(current_text, distractor) {
/**
 * Core task function for the 'Search' task
 * - Gets a question from the backend
 * - Makes 6 boxes (spans) where 3 are correct and three are incorrect
 * - The boxes are arranged randomly
 */
    console.log('onReadySearch()');

// Specific code starts here
    console.log('[1] distractors:');
    console.log(distractor);
    console.log('[1] current_text:');
    console.log(current_text);

    var pruned_text = Array();
    for(var i = 0; i < current_text.length; i++) { 
        if(current_text[i].match(/\w+/)) {
            pruned_text.push(current_text[i].toLowerCase());
        }
    } 
    var pruned_text_set = new Set(pruned_text);
    pruned_text = Array.from(pruned_text_set);
    console.log('[2] pruned_text:');
    console.log(pruned_text);
    var pruned_distractors = Array();
    for(var i = 0; i < distractor.length; i++) { 
        pruned_distractors.push(distractor[i].toLowerCase());
    }
    var pruned_distractors_set = new Set(pruned_distractors);
    pruned_distractors = Array.from(pruned_distractors_set);

    var tb = '';
    var allWords = Array();
    var distractors = Array();
    var repl = Array();
    
    for(var i = 0; i < 3; i++) {

        var wselect = randomChoice(pruned_text);
        repl.push(wselect);
        pruned_text = arrayRemove(pruned_text, wselect);

        var dselect = randomChoice(pruned_distractors);
        distractors.push(dselect);
        pruned_distractors = arrayRemove(pruned_distractors, dselect);

        console.log('[3] pruned_distractors:');
        console.log(pruned_distractors);
        console.log('[3] pruned_text:');
        console.log(pruned_text);
    }
  
    console.log('[4] distractors:');
    console.log(distractors);
    console.log('[4] repl:');
    console.log(repl);

    var replacements = pruned_text.slice(); 
    for(var i = 0; i < 3; i++) {
        var d = distractors[i];
        console.log('d: ' + d);
        // FIXME: We need an API change here, we need to be able to get more than one distractor
        var word = repl[i];
        console.log('word: ' + word);
//        replacements = arrayRemove(replacements, word);
        var tw = '<span onClick="checkInputSearch(event)" class="wordGuess" data-value="true">' + word.toLowerCase() + '</span>';
        var fw = '<span onClick="checkInputSearch(event)" class="wordGuess" data-value="false">' + d.toLowerCase() + '</span>';
        allWords.push(tw);
        allWords.push(fw);
    }
    allWords = allWords.sort(randomSort);
    for(var i = 0; i < allWords.length; i++) {
        if(i == 3) {
            tb += '<br/>';
            tb += '<br/>';
        }
        tb += allWords[i] + ' ';
    }

    tbox = document.getElementById('textbox');

    tbox.innerHTML = tb;
}

function randomChoice(choices) {
    var index = Math.floor(Math.random() * choices.length);
    return choices[index];
}

function maybeCounter(counter) {
/** 
 * A function that either returns or initialises a counter in localstorage
 */
    var counter = localStorage.getItem(counter);
    if(counter == false) {
        localStorage.setItem(counter, Number(0));
        counter = localStorage.getItem(counter);
    }
    return Number(counter);
}

function checkInputSearch(e) {
/**
 * This is for the searching task, which is select K words found in the audio from N words in total
 * It checks to see if the answer is correct or incorrect and sets the colour accordingly
 * Then it redraws the feedback.
 */ 
    console.log('checkInputSearch()');

    var nclicks = maybeCounter('searchClicks'); // always returns either 0 or the number
    localStorage.setItem('searchClicks', Number(nclicks) + Number(1));

    var trueclicks = maybeCounter('trueClicks');

    var res = e.target.getAttribute('data-value');
    if(res == "false") {
        e.target.setAttribute('class', 'wordGuessIncorrect');
    } else {
        e.target.setAttribute('class', 'wordGuessCorrect');
        localStorage.setItem('trueClicks', Number(trueclicks) + Number(1));
    }

    console.log('nclicks: ' + nclicks);
    console.log('trueclicks: ' + trueclicks);

    if(nclicks == 2) {
        var buttons = document.querySelectorAll('[class="wordGuess"]')
        for(var i = 0; i < buttons.length; i++) {
          buttons[i].removeAttribute("onClick");
        }
        var responses = localStorage.getItem("responses");
        if(nclicks == trueclicks) {
            console.log('CORRECT!');
            responses += '+';
        } else {
            responses += '-';
        }
        var allTrue = document.querySelectorAll('[data-value="true"]');
        for(var i = 0; i < allTrue.length; i++) {
            if(allTrue[i].getAttribute('class') == 'wordGuessCorrect') { 
                continue;
            }
            allTrue[i].setAttribute('style', 'color:green');
        }
        localStorage.setItem("responses", responses);
        localStorage.removeItem('searchClicks'); 
        localStorage.removeItem('trueClicks'); 
        endTask();
    }

    clearFeedback();
    drawFeedback();
}


