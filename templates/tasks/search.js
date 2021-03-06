
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

