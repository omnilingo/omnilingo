class Question {


	constructor(nodeId, language, indexPos, content, enabledTasks)
	{
		// ["3", "15", "2.14", "common_voice_fi_23997037.mp3", "bf2690ae993709439fa21cdc400bb48662d509ef78caceb246a7172e8357c785", "Siit\u00e4 se tulee.", "5f60020b96d36cf3fc78eb00c3fb7b1740f7a01f687dd5e5afea2e828f9943b5"]
		console.log('Question()');

		this.language = language;
		this.globalIndexPos = indexPos;
		this.nodeId = nodeId;
		this.sentenceCid = content["sentence_cid"];
		this.audioCid = content["clip_cid"];
		this.metaCid = content["meta_cid"];
		this.audioLength = Number(content["length"]);
		this.audioSpeed = Number(content["chars_sec"]);
		this.remainingTasks = enabledTasks;
		this.taskWeights = {};
		this.taskSequence = {};

		console.log(this.audioCid + " / " + this.textCid);
	}

	getGlobalIndexPos() {
		return this.globalIndexPos;
	}

	updateScore(task, time, weight)
	{
		this.taskWeights[task] = weight;
		this.taskSequence[task] = time;

		this.setCompletedTask(task);
	}

	setCompletedTask(task)
	{
		this.remainingTasks = arrayRemove(this.remainingTasks, task);
	}

	getRandomRemainingTask()
	{
		if(getRandomInt(0, 1)) {
			return this.remainingTasks.shift();
		}
		return this.remainingTasks.pop();
	}

	getRemainingTasks()
	{
		return this.remainingTasks;
	}
	async init() {
		this.sentence = JSON.parse(await fetchIpfsS(this.sentenceCid));
		this.meta = JSON.parse(await fetchIpfsS(this.metaCid));
	}

}
