class Activity {

	constructor(question) {
		console.log('Activity()');

		this.question = question;
		this.complete = false;
		this.running = false;
	}

	initActivity = async() => {
		await this.question.init();
		document.getElementById("text").innerText = this.question.sentence["content"];
		await this.setupAudio();
	}

	init = async() => {
		initActivity();
	}

	setRunning(b) {
		this.running = b;
	}

	isRunning() {
		return this.running;
	}

	setupAudio = async () => {
		var player = document.getElementById('player');
		var source = document.getElementById('audioSource');
		var bytes = await fetchIpfsB(this.question.audioCid);

		source.type = 'audio/mp3';
		source.src = URL.createObjectURL(new Blob([bytes]), {type: 'audio/mp3'});

		console.log("[audio_src] " + source.src);

		player.load();
	}
}
