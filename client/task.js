class Task extends Activity {

	constructor(question) {
		console.log('Task()');
		super(question);

		this.chars = [];
		this.question = question;
		this.complete = false;
		this.answer = "";
	}

	initTask = async() => {
		await this.initActivity();
		await this.fetchData();
	}
	init = async() => {
		await this.initTask();
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

/*
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
*/

	fetchData = async () => {
		//console.log('[Task] fetchData()');
		//this.tokensPath = hashToPath(this.question.textHash) + '/info';
		//const tokensPromise = fetch(STATIC_URL + this.question.language + '/text/' + this.tokensPath);
		console.log("[tokens_src] " + this.question.metaCid);
		const tokensPromise = fetchIpfsS(this.question.metaCid);
		const allData = await Promise.all([tokensPromise]);

		console.log(allData);

		var metadata = JSON.parse(allData[0]);

		console.log(metadata);

		this.sentenceText = this.question.sentence["content"];
		this.tokens = this.question.meta["tokens"];
		this.tags = this.question.meta["tags"];

		this.chars = {}
		for(var i = 0; i < this.tokens.length; i++) {
			this.chars[i] = [];
			for(var j = 0; j < this.tokens[i].length; j++) {
				this.chars[i].push(this.tokens[i][j]);
			}
		}

		console.log(this.tokens);
		console.log(this.tags);
		console.log(this.chars);
		//console.log(metadata);
		//this.chars.push(this.metadata[i][2]);
		//await this.fetchDistractors();

		this.validateTasks();
	}
}
