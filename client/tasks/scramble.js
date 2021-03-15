function onReadyScramble(current_text) {
    /** 
     *	onReady function for the Scamble task
     *	- It gets a set of characters and randomises the order
     * - It creates tiles (spans) for each of the characters
     * - Creates slots for the tiles to be dragged into.
     */
    console.log('onReadyScramble()');

    tbox = document.getElementById('textbox');


    // Generate an array of characters containing all the characters in the text 
    chars = Array();
    for(var i = 0; i < current_text.length; i++) {
        for(var j = 0; j < current_text[i].length; j++) {
          chars.push(current_text[i][j]);
        }
        chars.push(" ");
    }
    // Generate boxes to drag the characters into.
    tb = "";
    for(var i = 0; i < chars.length; i++) {
        // FIXME: do this properly
        if(chars[i] == '.' || chars[i] == '?' || chars[i] == ','  || chars[i] == ':'  || chars[i] == ';'  || chars[i] == '!' || chars[i] == '“' || chars[i] == '"') {
          tb += '<span>' + chars[i] + '</span>';
          continue;
        }
        if(chars[i] == " ") {
          tb += '<span style="color: white" data-space="true"> _ </span>';
        } else {
          tb += '<span id="dz'+i+'" class="targetBox" onClick="onTargetClick(event,\'dz'+i+'\')" data-target="'+chars[i]+'"> ? </span>';
        } 

    } 
    cbox = document.getElementById('clues');
    var set1 = new Set(chars);
    var arr1 = Array.from(set1);
    arr1 = shuffleArray(arr1);
    cb = "";
    for(var i = 0; i < arr1.length; i++) {
        if(i % (arr1.length/2) == 0) {
            // FIXME: do this properly
            cb += '<br/>';
            cb += '<br/>';
        }
        if(arr1[i] == " ") {
            continue;
        }
        // FIXME: do this properly
        if(arr1[i] == '.' || arr1[i] == '?' || arr1[i] == ','  || arr1[i] == ':'  || arr1[i] == ';'  || arr1[i] == '!' || arr1[i] == '“' || arr1[i] == '"') {
            continue;
        } else {    
            cb += '<span class="clue" onClick="onSourceClick(event)" data-value="'+arr1[i] +'">' + arr1[i].toLowerCase() + '</span>';
            cb += '<span style="color: white"> _ </span>';
        } 
    }
	console.log('set1:')
    console.log(set1);
    cbox.innerHTML = cb;
    tbox.innerHTML = '<br/>' + tb;
}

function onSourceClick(e) {
/**
 * When we click on a source tile
 * - We set its background colour to yellow.
 */
    console.log('onSourceClick()');
   console.log('e:')
    console.log(e);
    e.target.setAttribute('data-clicked', 'tile');
//    e.dataTransfer.setData('value', e.currentTarget.dataset.value);
   e.currentTarget.style.backgroundColor = 'yellow';
}

function correctClick(dz, trg_val) {
/**
 * If we get a correct click then we need to do three things: 
 * - Update the box so that it is correct (green)
 * - Check if we have a whole word correct, in which case we remove the internal boxes and set an external box as green
 * - Return the number of correct words we got so far
 */
    console.log('correctClick()');
    dz.innerHTML = trg_val;
    dz.setAttribute('class', 'correct targetBox');
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
            if(target_token != "" && current_token != "") {
              target_tokens.push(target_token);
              current_tokens.push(current_token);
              target_ids.push(target_id);
            }
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
                //tbox.removeChild(toDelete);
                toDelete.setAttribute('style', 'display:none');
                toDelete.removeAttribute('data-target');
            }
            // Put a fancy green box around it
            wbox = document.getElementById(target_ids[i][0]);
            wbox.setAttribute('data-target', target_tokens[i]);
            wbox.setAttribute("style", "border-radius: 5px; border: 2px solid green; padding: 5px;");
            wbox.setAttribute("class", "correct");
            wbox.innerHTML = target_tokens[i];
        }
    }

    return ncorrect;
}

function incorrectClick() {
    console.log('incorrectClick()');
}


function onTargetClick(e, tid) {
/**
 * This is called when we drop the tile on a target
 * - We should check if the target and the tile match and update the colour
 * - This also merges those drop squares when the whole word is complete and sets the border to green
 * - It should also check to see if the whole response is right and update the responses as necessary
 */
    console.log('onTargetClick()');
    console.log('tid:' + tid);
    var trg = e.target;
    var trg_val = trg.getAttribute('data-target');
    dz = document.getElementById(tid);
    var src = document.querySelectorAll('[data-clicked="tile"]')[0];
    var src_val = src.getAttribute('data-value');

    console.log('dz:' + dz);
    console.log('[src] tile [value]:' + src_val);
    console.log('[trg] box [value]:' + trg_val);

    if(src_val.toLowerCase() == trg_val.toLowerCase()) {
        var ncorrect = correctClick(dz, trg_val);

        console.log('XX: ' + ncorrect + ' || ' + target_tokens.length);
        if(ncorrect == target_tokens.length) {
            responses = localStorage.getItem('responses');
            responses += "+"; 
            localStorage.setItem('responses', responses);
            clearFeedback();
            drawFeedback();
        }
    } else {
        incorrectClick();
    }
    src.removeAttribute('data-clicked');
    src.setAttribute('style', 'background-color:#bababa');
}

