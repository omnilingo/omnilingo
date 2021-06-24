class Task {

	constructor(question) {
		console.log('Task()');

		this.question = question;
		this.complete = false;
		this.answer = "";
		this.running = false;
	}

	init = async() => {
		this.setupAudio();
		await this.fetchData();
	}

	setRunning(b) {
		this.running = b;
	}

	isRunning() {
		return this.running;
	}

	setupAudio() {

		//this.currentAudio = hashToPath(this.question.audioHash) + '/audio.mp3';
		var player = document.getElementById('player');
		var source = document.getElementById('audioSource');

		source.type = 'audio/mp3';
		source.src = IPFS_PROXY + this.question.audioCid;

		console.log("[audio_src] " + source.src);

		//player.setAttribute('onPlay', 'onStartTimer()');
		player.load();
	}

	validateTasks() {

		var foundDistractor = false;
		for(var token in this.distractors) {
			if(this.distractors[token].length > 0) {
				foundDistractor = true;
			}
		}
		if(foundDistractor) {
			return;
		}

		this.question.setCompletedTask("choice");
	}

	fetchDistractors = async () => {
		this.tokensPath = hashToPath(this.question.textHash) + '/dist';
		const tokensPromise = fetch(STATIC_URL + this.question.language + '/text/' + this.tokensPath);
		const meta = await Promise.all([tokensPromise]);
		const metaData = meta.map(response => response.text());
		const allData = await Promise.all(metaData);

		if(allData[0].match('Not Found') == 'Not Found') {
			this.distractors = {};
			this.question.setCompletedTask("choice");
			this.question.setCompletedTask("search");
		} else {
			var metadata = JSON.parse(allData[0]);

			this.distractors = metadata["distractors"];
		}

	}

	fetchData = async () => {
		//console.log('[Task] fetchData()');
		//this.tokensPath = hashToPath(this.question.textHash) + '/info';
		//const tokensPromise = fetch(STATIC_URL + this.question.language + '/text/' + this.tokensPath);
		console.log("[tokens_src] " + IPFS_PROXY + this.question.metaCid);
		const tokensPromise = fetch(IPFS_PROXY + this.question.metaCid, {credentials: "omit"});
		const meta = await Promise.all([tokensPromise]);
		const metaData = meta.map(response => response.text());
		const allData = await Promise.all(metaData);

		console.log(allData);

		var metadata = JSON.parse(allData[0]);

		console.log(metadata);

		this.tokens = metadata["tokens"];

		console.log(this.tokens);
/*
		this.metadata = metadata["tokens"];

		this.tokens = [];
		this.tags = [];
		this.chars = [];

		for(var i in this.metadata) {
			this.tokens.push(this.metadata[i][0]);
			this.tags.push(this.metadata[i][1]);
			this.chars.push(this.metadata[i][2]);
		}

*/
		//await this.fetchDistractors();

		this.validateTasks();
	}
}
