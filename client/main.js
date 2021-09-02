const IPFS = require('ipfs')


fetchIpfsB = async (cid) => {
	if (cid.startsWith("k5")) {
		cid_s = await fetch('https://gateway.ipfs.io/api/v0/name/resolve?arg=' + cid);
		cid_json = await cid_s.json();
		cid = cid_json["Path"];
		if(cid.startsWith("/ipfs/")) {
			cid = cid.substring("/ipfs/".length);
		}
		else {
			console.log("resolved unsupported ipfs path " + cid);
		}
	}
	const chunks = []
	for await (const chunk of document.ipfs.cat(cid)) {
		chunks.push(chunk)
	}

	const s = new Uint8Array(chunks.reduce( (acc, cur) => { acc.push(...cur); return acc }, []));
	console.log("fetched: " + cid);
	return s;
}

fetchIpfsS = async (cid) => {
	const s = new TextDecoder('utf8').decode(await fetchIpfsB(cid));
	console.log("fetched: " + s);
	return s;
}

const decideDefaultLanguage = async (indexes) => {
	/**
	 *	Takes the returned list of language indexes
	 *	and chooses a default language based on user preferences
	 */
	console.log("decideDefaultLanguage()");

	const enabledLanguages = Object.keys(indexes);
	// Is there only one?
	if (enabledLanguages.length == 1) {
		var currentLanguage = enabledLanguages[0];
		localStorage.setItem("currentLanguage", currentLanguage);
		return currentLanguage;
	}

	// Is one being passed in the URL?
	var currentLanguage = findGetParameter("language");
	if(currentLanguage != false) {
		if(indexes[currentLanguage]) {
			return currentLanguage;
		}
	}

	// Is one already set and is it in the browser?
	var currentLanguage = localStorage.getItem("currentLanguage");
	if(currentLanguage != false) {
		if(indexes[currentLanguage]) {
			return currentLanguage;
		}
	}

	// What languages is the browser set to?
	const intersectionLanguages = enabledLanguages.filter(
		value => window.navigator.languages.includes(value)
	);

	// Take the intersection with what languages we have and
	// return one at random
	if(intersectionLanguages.length > 0) {
		var currentLanguage = intersectionLanguages[getRandomInt(0, intersectionLanguages.length - 1)];
		localStorage.setItem("currentLanguage", currentLanguage);
		return currentLanguage
	}

	// Choose the first non-English one
	for(var i in enabledLanguages) {
		language = enabledLanguages[i];
		if(language != "en") {
			localStorage.setItem("currentLanguage", language);
			return language;
		}
	}
	localStorage.setItem("currentLanguage", enabledLanguages[0]);
	return enabledLanguages[0];
}

const getLanguageMeta = async (language) => {

	console.log("getLanguageMeta()");

	const metaPromise = fetch(STATIC_URL + "/" + language + "/meta");
	const meta = await Promise.all([metaPromise]);
	const metaData = meta.map(response => response.json());
	const allData = await Promise.all(metaData);

	return allData[0];
}


const getIndexes = async () => {
	// Pulls down the list of indexes (e.g. languages)
	console.log("getIndexes() !");

	const indexesPromise = fetchIpfsS(GLOBAL_INDEX);

	const indexes = await Promise.all([indexesPromise]);
	const indexesData = indexes.map(JSON.parse);
	const allData = await Promise.all(indexesData);

	return allData[0];
}

const populateLanguageSelector = async (indexes, defaultLanguage) => {
	console.log("populateLanguageSelector()");
	languageSelector = document.getElementById("languages");

	var enabled = "";
	for(var language in indexes) {
			enabled += language + " ";
			var languageElem = document.createElement("option");
			var languageText = document.createTextNode(languageNames[language]); // Display name
			if(defaultLanguage == language) {
				languageElem.setAttribute("selected","");
			}
			languageElem.setAttribute("value", language);
			languageElem.appendChild(languageText);
			languageSelector.appendChild(languageElem);
	}
	console.log("  [languages] "  + enabled);
}

const runLanguage = async (language, cid, acceptingChars) => {

	document.omnilingo = new OmniLingo();

	await document.omnilingo.setup(language, cid);

	document.omnilingo.cleanup();

	var h = document.documentElement;
	if(language == "ar" || language == "fa" || language == "dv") { // FIXME: be cleverer here
		// <html dir="rtl" language="ar">
		h.setAttribute('dir', 'rtl');
	} else {
		h.setAttribute('dir', 'ltr');
	}
	h.setAttribute('lang', language);

	document.omnilingo.setEquivalentChars(acceptingChars);

	await document.omnilingo.fetchIndex();

	// Get the current level

	document.omnilingo.run();
}

const main = async () => {
	document.ipfs = await IPFS.create();


	var indexes = await getIndexes();

        console.log("  [indexes] ");
        console.log(indexes);


	var defaultLanguage = await decideDefaultLanguage(indexes);

	console.log("  [defaultLanguage] " + defaultLanguage);

	populateLanguageSelector(indexes, defaultLanguage);

	//var metaData = await getLanguageMeta(defaultLanguage);

	window.onkeydown = globalKeyDown;

	//var acceptingChars = metaData["accept"];

	//console.log('  [acceptingChars]');
	//console.log(acceptingChars);
	console.log(indexes["fi"]);

	runLanguage(defaultLanguage, indexes[defaultLanguage][0], {}); //acceptingChars);
}

window.onload = main;
