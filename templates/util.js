
function changeLanguage(elem) {
   console.log('changeLanguage: ' + elem.value);
   localStorage.setItem('currentLanguage', elem.value);
   localStorage.setItem('responses', Array());
   location.reload(); 
}


function changeLevel(elem) {
   console.log('changeLevel: ' + elem.value);
   localStorage.setItem('currentLevel', elem.value);
   location.reload(); 
}

function getRandomInt(min, max) {
    // Generate a pseudo-random integer between min and max
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clearFeedback() {
    console.log('clearFeedback()');
    var myNode = document.getElementById("feedback");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
}



function shuffleArray(array) {
   let curId = array.length;
   // There remain elements to shuffle
   while (0 !== curId) {
      // Pick a remaining element
      let randId = Math.floor(Math.random() * curId);
      curId -= 1;
      // Swap it with the current element.
      let tmp = array[curId];
      array[curId] = array[randId];
      array[randId] = tmp;
   }
   return array;
}


