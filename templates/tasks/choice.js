
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

/*************************************************************************************/
// Unrefactored functions below here
/*************************************************************************************/

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
    endTask();
    clearFeedback();
    drawFeedback();
}

function matchCase(word, distractor) {
/** 
 * Matches the case of a distractor to the word it is intended to replace
 */
   console.log('matchCase() ' + word + ' ||| ' + distractor);
   if(word[0] == word[0].toUpperCase()) {
       var recasedDistractor = distractor[0].toUpperCase() + distractor.slice(1, distractor.length);
       return recasedDistractor;
   } else if(word[0] == word[0].toLowerCase()) {
       var recasedDistractor = distractor[0].toLowerCase() + distractor.slice(1, distractor.length);
       return recasedDistractor;
   } else {
       console.log('FAIL? ' + word + ' ||| ' + distractor);
       return distractor;
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
    var distractor = matchCase(current_text[gap], distractors[0]); 
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

