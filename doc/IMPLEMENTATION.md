# Design notes

## Client

### Classes

* `OmniLingo`: Contains the code for fetching the index for a language
* `Graph`: Implements a graph used for selecting random paths and saving state
* `Question`: Implements the question from the index (audio and text hashes + metrics)
* `Task`: Implements the fetching of data from the backend
  * `BlankTask`: Implements the Cloze-style gap-filling task
  * `ScrambleTask`: Implements the scrambled tiles word-creation task

### Other files 

* `util.js`: Contains miscellaneous ancilliary functions
* `callbacks.js`: Functions that implement callbacks from the HTML
* `main.js`: The main driver script
