
/********************************************************************/
// Above here should be moved to util.js but they are called in main()
/********************************************************************/

function main() {
    /* Loads all the js libraries and project modules, then calls onReady. */
    console.log('main()');

    enabledTasks = localStorage.getItem('enabledTasks');
    if(!enabledTasks) {
        localStorage.setItem('enabledTasks', {'blanks': true, 'choice': true, 'scramble': true, 'search':true});
    }
    enabledTasks = localStorage.getItem('enabledTasks');

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


    onReady();
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

window.onload = main;
