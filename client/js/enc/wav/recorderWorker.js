var recLength = 0,
  recBuffers = [],
  sampleRate;

this.onmessage = function(e) {

  var command = e.data.command;

  switch (command) {
    case 'init':
      init(e.data.config);
      break;
    case 'record':
      record(e.data.buffer);
      break;
    case 'finish':
      sendWAVFile();
      break;
  }

};

function init(config) {

  sampleRate = config.sampleRate;

}

function record(inputBuffer) {

  //console.log('inputBuffer.length:' + inputBuffer.length);
  recBuffers.push(inputBuffer);
  recLength += inputBuffer.length;

}

function sendWAVFile() {

  //console.log('recBuffers.length:' + recBuffers.length);
  //console.log('recLength:' + recLength);

  var buffer = mergeBuffers(recBuffers, recLength);
  var dataview = encodeWAV(buffer);

  var audioBlob = new Blob([dataview], {
    type: "audio/wav"
  });

  self.postMessage({
    command: 'wav',
    buf: audioBlob
  });

  recBuffers = [];
  recLength = 0;
}

function writeString(view, offset, string) {

  for (var i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }

}

function mergeBuffers(recBuffers, recLength) {

  var result = new Float32Array(recLength);

  var offset = 0;

  for (var i = 0; i < recBuffers.length; i++) {

    result.set(recBuffers[i], offset);
    offset += recBuffers[i].length;

  }
  return result;

}

function floatTo16BitPCM(output, offset, input) {

  for (var i = 0; i < input.length; i++, offset += 2) {
    var s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

}

function encodeWAV(samples) {

  var buffer = new ArrayBuffer(44 + samples.length * 2);
  var view = new DataView(buffer);

  //write the 44 bytes 'header'

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');

  /* file length */
  view.setUint32(4, 32 + samples.length * 2, true);

  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');

  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);

  /* channel count */
  view.setUint16(22, 1 /* MONO */ , true);

  /* sample rate */
  view.setUint32(24, sampleRate, true);

  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 2 /* 16 bits = 2 bytes = MONO*/ , true);

  /* block align (channel count * bytes per sample) */
  view.setUint16(32, 2 /*MONO*/ , true);

  /* bits per sample */
  view.setUint16(34, 16, true);

  /* data chunk identifier */
  writeString(view, 36, 'data');

  /* data chunk length */
  view.setUint32(40, samples.length * 2, true);

  floatTo16BitPCM(view, 44, samples);

  return view;
}