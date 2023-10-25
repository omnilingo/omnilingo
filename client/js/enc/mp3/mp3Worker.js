importScripts('libmp3lame.js');

var mp3codec;

var recLength = 0,
	recBuffers = [];

//https://github.com/gypified/libmp3lame/blob/master/API

self.onmessage = function(e) {

	switch (e.data.command) {

		case 'init':
			init(e.data.config);
			break;
		case 'encode':
			encode(e);
			break;
		case 'finish':
			finish();
			break;
	}
};

function init(config) {

	if (!config) {
		config = {};
	}

	mp3codec = Lame.init();

	Lame.set_mode(mp3codec, config.mode || Lame.JOINT_STEREO);
	Lame.set_num_channels(mp3codec, config.channels || 2);
	Lame.set_out_samplerate(mp3codec, config.samplerate || 44100);
	Lame.set_in_samplerate(mp3codec, config.in_samplerate || 44100);
	/*The default is a  J-Stereo, 44.1khz, 128kbps CBR mp3 file at quality 5.*/
	Lame.set_bitrate(mp3codec, config.bitrate || 128);

	//Lame.set_mode(mp3codec, 1);
	//lame.set_quality(mp3codec,2);   /* 2=high  5 = medium  7=low */ 
	//Lame.set_num_samples(mp3codec, e.data.config.samples || -1);

	Lame.init_params(mp3codec);

	// console.log('Version :', Lame.get_version() + ' / ',
	// 	'Mode: ' + Lame.get_mode(mp3codec) + ' / ',
	// 	'Samples: ' + Lame.get_num_samples(mp3codec) + ' / ',
	// 	'Channels: ' + Lame.get_num_channels(mp3codec) + ' / ',
	// 	'Input Samplate: ' + Lame.get_in_samplerate(mp3codec) + ' / ',
	// 	'Output Samplate: ' + Lame.get_in_samplerate(mp3codec) + ' / ',
	// 	'Bitlate :' + Lame.get_bitrate(mp3codec) + ' / ',
	// 	'VBR :' + Lame.get_VBR(mp3codec));

}

function encode(e) {

	var mp3data = Lame.encode_buffer_ieee_float(mp3codec, e.data.buf, e.data.buf);

	//self.postMessage({
	//	command: 'data',
	//	buf: mp3data.data
	//});

	///console.log(mp3data.data.toString('hex'));

	recBuffers.push(mp3data.data);
	recLength += mp3data.data.length;

}

function finish() {

	//console.log('recBuffers.length:' + recBuffers.length);
	//console.log('recLength:' + recLength);

	var mp3data = Lame.encode_flush(mp3codec);

	recBuffers.push(mp3data.data);
	recLength += mp3data.data.length;

	self.postMessage({
		command: 'data',
		buf: mp3data.data
	});

	var buffer = mergeBuffers(recBuffers, recLength);
	//buffer = new ArrayBuffer(buffer.length);
	var view = new Uint8Array(buffer);

	var audioBlob = new Blob([view], {
		type: "audio/mp3"
	});

	self.postMessage({
		command: 'mp3',
		buf: audioBlob
	});

	Lame.close(mp3codec);
	mp3codec = null;

	recBuffers = [];
	recLength = 0;
}

function mergeBuffers(recBuffers, recLength) {
	//Float32Array
	var result = new Float32Array(recLength);

	var offset = 0;

	for (var i = 0; i < recBuffers.length; i++) {

		result.set(recBuffers[i], offset);
		offset += recBuffers[i].length;

	}

	return result;

}
