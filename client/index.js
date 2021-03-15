
function getRandomInt(min, max) {
    // Generate a pseudo-random integer between min and max
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function nextButton() { 
    console.log('nextButton()');

    var lang = localStorage.getItem('currentLanguage');

    nextQuestion(lang);
}

const displayQuestion = async (question) => {
    console.log('displayQuestion() ' + question);

    var gap = getRandomInt(0, question.length);


    var tbox = document.getElementById('textbox');
    tbox.innerHTML = buildTbox(question, gap);

}

const nextQuestion = async (lang) => {
    console.log('nextQuestion() ' + lang);
    // 8	69	6	common_voice_fi_24001101.mp3	fa032123ba94a9aafc037ca10a5eac754ef410288c8dde2b2c666ed5e10222f2	Mysteerimies oli oppinut moraalinsa taruista, elokuvista ja peleistä.	a8f9eb3f56f2048df119a9ad1d210d0b98fda56f3e2a387f14fe2d652241f3ec

    var index = document.questionIndex;

    var current_question = getRandomInt(0, index.length);

    console.log('[current_question] ' + current_question);

    console.log(index[current_question]);

    var audio_hash = index[current_question][4];

    console.log('[audio_hash] ' + audio_hash);

    var current_audio = audio_hash.slice(0,2) + '/' + audio_hash.slice(2,6) + '/' + audio_hash + '/audio.mp3';

    console.log('[audio_path] ' + current_audio);

    var text_hash = index[current_question][6];
    var current_text = text_hash.slice(0,2) + '/' + text_hash.slice(2,6) + '/' + text_hash + '/text';
    var current_tokens = text_hash.slice(0,2) + '/' + text_hash.slice(2,6) + '/' + text_hash + '/tokens';

    console.log('[text_hash] ' + text_hash);
    console.log('[text_path] ' + current_text);
    console.log('[tokens_path] ' + current_tokens);

    const textPromise = fetch('http://localhost:5001/static/' + lang + '/text/' + current_text);
    const tokensPromise = fetch('http://localhost:5001/static/' + lang + '/text/' + current_tokens);

    const meta = await Promise.all([textPromise, tokensPromise]);

    const metaData = meta.map(response => response.text());

    const allData = await Promise.all(metaData);

    console.log(allData[0]);
    var tokens = allData[1].split(' ');
    console.log(allData[1]);

    var player = document.getElementById('player');
    player.setAttribute('onPlay', 'startTimer()');
    var source = document.getElementById('audioSource');

    source.type = 'audio/mp3';
    // hash work here
    source.src = '/static/' + lang + '/clip/' + current_audio;
    console.log(source.src);
    player.load();


    displayQuestion(tokens);
}

const main = async () => {
    console.log('main()');

    var lang = await getIndexes();

    console.log('[language] ' + lang);

    var index = await getIndex(lang);

    document.questionIndex = index[0]["index"];
    document.questions = index[0]["index"].slice(0,20);

    console.log(document.questions);

    var graph = new Graph();
    graph.fromIndex(document.questions);

    nextQuestion(lang);

}

const getIndex = async (lang) => {
    console.log('getIndex() ' + lang);

    const indexPromise = fetch('http://localhost:5001/index/' + lang);
    const index = await Promise.all([indexPromise]);
    const indexData = index.map(response => response.json());

    console.log('indexData:');
    console.log(indexData);

    const allData = await Promise.all(indexData);

    console.log('allData:');
    console.log(allData);

    return allData;

}


const getIndexes = async () => {
    // Creates the language selection dialogue
    console.log('getIndexes()');

    const indexesPromise = fetch('http://localhost:5001/indexes');
    const indexes = await Promise.all([indexesPromise]);
    const indexesData = indexes.map(response => response.json());
    const allData = await Promise.all(indexesData);

    console.log(allData);
    
    languageSelector = document.getElementById('languages');

    console.log(allData[0]["indexes"]);

    for(var language in allData[0]["indexes"]) {
        console.log('[language] '  + language);
            var languageElem = document.createElement("option");
            var languageText = document.createTextNode(allData[0]["indexes"][language]["display"]); // Display name
            if(localStorage.getItem('currentLanguage') == language) {
                languageElem.setAttribute("selected","");
            }
            languageElem.setAttribute("value", language);
            languageElem.appendChild(languageText);
            languageSelector.appendChild(languageElem);
    }

    return language;
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



window.onload = main
