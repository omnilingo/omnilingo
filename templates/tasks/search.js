
function checkInputSearch(e) {
/**
 * This is for the searching task, which is select K words found in the audio from N words in total
 * It checks to see if the answer is correct or incorrect and sets the colour accordingly
 * Then it redraws the feedback.
 */ 
    console.log('checkInputSearch()');
    var res = e.target.getAttribute('data-value');
    if(res == "false") {
        e.target.setAttribute('class', 'wordGuessIncorrect');
    } else {
        e.target.setAttribute('class', 'wordGuessCorrect');
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
    var allWords = Array();
    var distractors = Array();
    var repl = Array();
    for(var i = 0; i < 3; i++) {
        distractors.push(getRandomInt(0,distractor.length - 1));
        repl.push(getRandomInt(0,current_text.length - 1));
    }
  
    console.log('distractors:');
    console.log(distractors);
    console.log('repl:');
    console.log(repl);

    var replacements = current_text.slice(); 
    for(var i = 0; i < 3; i++) {
        var d = distractors[i];
        console.log('d: ' + d);
        // FIXME: We need an API change here, we need to be able to get more than one distractor
        var word = current_text[repl[i]];
        console.log('word: ' + word);
        replacements = arrayRemove(replacements, word);
        var tw = '<span onClick="checkInputSearch(event)" class="wordGuess" data-value="true">' + word.toLowerCase() + '</span>';
        var ds = distractor[d]; 
        console.log('ds: ' + ds);
        var fw = '<span onClick="checkInputSearch(event)" class="wordGuess" data-value="false">' + ds.toLowerCase() + '</span>';
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

