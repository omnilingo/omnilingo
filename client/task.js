class Task {

	constructor(question) { 
		console.log('Task()');

		this.question = question;
		this.complete = false;
		this.answer = "";
	}
	
	init = async() => {
		this.setupAudio();
		await this.fetchData();
	}

	setupAudio() {

		this.currentAudio = hashToPath(this.question.audioHash) + '/audio.mp3';
		var player = document.getElementById('player');
		var source = document.getElementById('audioSource');

		source.type = 'audio/mp3';
		source.src = STATIC_URL + this.question.language + '/clip/' + this.currentAudio ;

		//player.setAttribute('onPlay', 'onStartTimer()');
		player.load();
	}

	fetchData = async () => { 
		//console.log('[Task] fetchData()');
		this.tokensPath = hashToPath(this.question.textHash) + '/info';
		const tokensPromise = fetch(STATIC_URL + this.question.language + '/text/' + this.tokensPath);
		const meta = await Promise.all([tokensPromise]);
		const metaData = meta.map(response => response.text());
		const allData = await Promise.all(metaData);

		var metadata = JSON.parse(allData[0]);
		//console.log('tokens:');
		//console.log(metadata["tokens"]);

		this.metadata = metadata["tokens"];

		this.tokens = [];
		this.tags = [];
		this.chars = [];

		for(var i in this.metadata) {
			this.tokens.push(this.metadata[i][0]);
			this.tags.push(this.metadata[i][1]);
			this.chars.push(this.metadata[i][2]);
		}
	}
}
