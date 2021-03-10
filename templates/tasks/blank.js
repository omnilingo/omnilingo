/** 
 * blank.js: Functions for the blanks task
 */


function onReadyBlank(current_text, gap) {
    /**
     * Run the Blank task
     */
    console.log('onReadyBlanks()');
    var tbox = document.getElementById('textbox');
    tbox.innerHTML = buildTbox(current_text, gap);
}

/*************************************************************************************/
// Unrefactored functions below here
/*************************************************************************************/

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
    endTask();
    clearFeedback();
    drawFeedback();
}



