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
	var chunks = [];
	var len = 0;
	for await (const chunk of document.ipfs.cat(cid)) {
	  chunks.push(chunk);
	  len += chunk.length;
	}
	var data = new Uint8Array(new ArrayBuffer(len));
	var i = 0;
	for (chunk of chunks) {
		data.set(chunk, i);
		i += chunk.length;
	}
	return data;
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

const getLanguageMeta = async (cid) => {

	console.log("getLanguageMeta()");

	const metaPromise = fetchIpfsS(cid);
	const meta = await Promise.all([metaPromise]);
	const metaData = meta.map(JSON.parse);
	const allData = await Promise.all(metaData);

	return allData[0];
}


const getIndexes = async () => {
	// Pulls down the list of indexes (e.g. languages)
	console.log("getIndexes() !");

	const indexesPromise = document.root_cids.map(fetchIpfsS);

	const indexes = await Promise.all(indexesPromise);
	const indexesData = indexes.map(JSON.parse);
	const allData = await Promise.all(indexesData);
	var mergedData = allData.reduce( function(z, x) {
		for(var lang in x) {
			if (z[lang]) {
				z[lang] = z[lang].concat(x[lang]);
			}
			else {
				z[lang] = x[lang];
			}
		}
		return z;
	});
        // Count the number of langs we have (for debugging, remove later)
        var count = 0;
	for(var lang in mergedData) {
            count++;
        }
        console.log(' [indexes] ' + count);
	return mergedData;
}

const populateLanguageSelector = async (indexes, defaultLanguage) => {
	console.log("populateLanguageSelector()");
	languageSelector = document.getElementById("languages");

	var enabled = "";
	languages = []
	for(var language in indexes) {
			var metaData = await getLanguageMeta(indexes[language]["meta"]);
			enabled += language + " ";
			var languageElem = document.createElement("option");
			var languageText = document.createTextNode(metaData["display"]); // Display name
			if(defaultLanguage == language) {
				languageElem.setAttribute("selected","");
			}
			languageElem.setAttribute("value", language);
			languageElem.appendChild(languageText);
			languages.push(languageElem);
	}
	languageSelector.replaceChildren(...languages);
	console.log("  [languages] "  + enabled);
}

const runLanguage = async (language, cids, acceptingChars) => {

	document.omnilingo = new OmniLingo();

	await document.omnilingo.setup(language, cids);

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
	if(!document.ipfs) {
		document.ipfs = await IPFS.create();
	}
	document.root_cids = localStorage.getItem("root-cids") ? localStorage.getItem("root-cids").split("\n") : GLOBAL_INDEXES;


	var indexes = await getIndexes();
	document.indexes = indexes;

        console.log("  [indexes] ");
        console.log(indexes);


	var defaultLanguage = await decideDefaultLanguage(indexes);

	console.log("  [defaultLanguage] " + defaultLanguage);

	populateLanguageSelector(indexes, defaultLanguage);

	// redundant call, we call it in populateLanguageSelector
	var metaData = await getLanguageMeta(indexes[defaultLanguage]["meta"]);

	window.onkeydown = globalKeyDown;

	var acceptingChars = metaData["alternatives"];

	//console.log('  [acceptingChars]');
	//console.log(acceptingChars);
	console.log(indexes["fi"]);

	runLanguage(defaultLanguage, indexes[defaultLanguage]["cids"], acceptingChars || {});
}

window.onload = main;
