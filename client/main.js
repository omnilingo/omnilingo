fetchIpfsB = async (cid) => {
	if (cid.startsWith("k5")) {
		for await (const cid_s of document.ipfs.name.resolve("/ipns/" + cid)) {
			cid = cid_s;
			break;
		}
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
	try {
		const j = JSON.parse(new TextDecoder('utf8').decode(data));
		if(j.encdata && document.keys && document.keys[j.keyfpr]) {
			const key = await decodeKey(document.keys[j.keyfpr]);
			return await decrypt(j, key, false);
		}
	}
	catch {
	}
	return data;
}

fetchIpfsS = async (cid) => {
	try {
		const s = new TextDecoder('utf8').decode(await fetchIpfsB(cid));
		console.log("fetched: " + s);
		return s;
	}
	catch {
		return null;
	}
}

fetchIpfsJ = async (cid, key = null) => {
	const s = await fetchIpfsS(cid);
	if (s === null)
		return s;
	const j = JSON.parse(s);
	if(j.encdata) {
		if(!key && document.keys && document.keys[j.keyfpr])
			key = await decodeKey(document.keys[j.keyfpr]);
		return JSON.parse(await decrypt(j, key));
	}
	else
		return j;
}

postIpfsJ = async (j) => {
	const res = await document.ipfs.add({content: JSON.stringify(j)});
	return res;
}

postIpnsJ = async (k5, j) => {
	const ipfs_res = await postIpfsJ(j);
	const res = await document.ipfs.name.publish(ipfs_res.cid, {"key": k5});
	var found = false;
	while (!found) {
		for await (const cid of document.ipfs.name.resolve("/ipns/" + k5)) {
			console.log("comparing " + cid + " and " + "/ipfs/" + ipfs_res.cid);
			if (cid == "/ipfs/" + ipfs_res.cid)
				found = true;
		}
	}
	return res;
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

const fetchRoot = async (cid) => {
	const x = await fetchIpfsJ(cid);
	if(x["keys"]) {
		xs = new Array();
		if(!document.keys)
			document.keys = x["keys"];
		else
			Object.assign(document.keys, x["keys"]);
		for(var k in x["keys"]) {
			xs.push(fetchIpfsJ(x[k]));
		}
		return await Promise.all(xs);
	}
	return [x];
};

function mergeIndex(x, y) {
	var z = {};
	Object.assign(z, x);
	for(const l in y) {
		if (!z[l]) {
			z[l] = y[l];
		}
		else {
			z[l]["cids"] = z[l]["cids"].concat(y[l]["cids"])
			if(!z[l]["meta"])
				z[l]["meta"] = y[l]["meta"];
		}
	}
	return z;
}


const getIndexes = async () => {
	// Pulls down the list of indexes (e.g. languages)
	console.log("getIndexes() !");

	const indexesPromise = document.root_cids.map(fetchRoot);
	const allData = await Promise.all(indexesPromise);
	var mergedData = allData.reduce( function(z, xs) {
		for(var x of xs) {
			z = mergeIndex(z, x);
		}
		return z;
	}, {});
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
		document.ipfs = window.KuboRpcClient.create()
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
	if(document.getElementById("contribute"))
		await onLoadKeys();
}

window.addEventListener("load", main);
