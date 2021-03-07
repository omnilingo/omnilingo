
function main() {
    /* Loads all the js libraries and project modules, then calls onReady. */
    console.log('main()');

    var enabledTasks = localStorage.getItem('enabledTasks');
    if(enabledTasks == null) {
        var et = {'blanks': true, 'choice': true, 'scramble': true, 'search':true};
        localStorage.setItem('enabledTasks', JSON.stringify(et));
    }
    var enabledTasks = localStorage.getItem('enabledTasks');
    if(enabledTasks.length == 0 || enabledTasks.length == 15) {
        var et = {'blanks': true, 'choice': true, 'scramble': true, 'search':true};
        localStorage.setItem('enabledTasks', JSON.stringify(et));
    }
    enabledTasks = JSON.parse(localStorage.getItem('enabledTasks'));
    console.log('enabledTasks:');
    console.log(enabledTasks);

    // This allows us to capture Enter, Tab, Space etc.
    window.onkeydown = globalKeyDown;

    if(!localStorage.getItem('currentLevel')) {
        localStorage.setItem('currentLevel', 1);
    }
    var foundLang = findGetParameter("language");
    console.log('foundLang: ' + foundLang);
    if(!localStorage.getItem('currentLanguage') && foundLang == null) {
        localStorage.setItem('currentLanguage', 'fi');
    }
    if(foundLang != null) {
        // FIXME: this should probably check that it is a valid language
        localStorage.setItem('currentLanguage', foundLang);
    }
    var lang = localStorage.getItem('currentLanguage');
    console.log('lang: ' + lang);
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
     */
    console.log('updateTask() ' + task.id + ' → ' + task.checked);
    var enabledTasks = JSON.parse(localStorage.getItem('enabledTasks'));
    if(task.id == 'enableBlanks') {
        enabledTasks['blanks'] = task.checked;
    } 
    if(task.id == 'enableChoice') {
        enabledTasks['choice'] = task.checked;
    } 
    if(task.id == 'enableScrams') {
        enabledTasks['scramble'] = task.checked;
    } 
    if(task.id == 'enableSearch') {
        enabledTasks['search'] = task.checked;
    } 
    localStorage.setItem('enabledTasks', JSON.stringify(enabledTasks));
}

function onReady() {
/** 
 * First it makes an array of the available tasks
 * Then it chooses a task and calls the relevant sub-onReady function.
 */
     
    var enabledTasks = JSON.parse(localStorage.getItem('enabledTasks'));
    var tasks = Array();
    if(enabledTasks['blanks']) { tasks.push('blanks'); }
    if(enabledTasks['choice']) { tasks.push('choice'); }
    if(enabledTasks['scramble']) { tasks.push('scramble'); }
    if(enabledTasks['search']) { tasks.push('search'); }

    var current_language = localStorage.getItem('currentLanguage')

    var questions = {};
    var player = document.getElementById('player');
    var source = document.getElementById('audioSource');
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/get_clips?nlevels=10&enabled='+tasks.join("|") +'&level=' + current_level + '&language=' + current_language);
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
        } else if(task_type == "search") {
            onReadySearch(current_text, distractor);
        } else {
            console.log("TASK: not implemented, assigning blank");
            onReadyBlank(current_text, gap);
        }
    };
// General code starts here
    xhr.send();
}

function findGetParameter(parameterName) {
    console.log('findGetParameter() ' + parameterName);
    var result = null,
        tmp = [];
    var items = location.search.substr(1).split("&");
    for (var index = 0; index < items.length; index++) {
        tmp = items[index].split("=");
        if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
    }
    return result;
}

window.onload = main;
