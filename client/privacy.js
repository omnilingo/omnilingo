async function encodeKey(key) {
	return await window.crypto.subtle.exportKey("jwk", key);
}
async function decodeKey(key) {
	return await window.crypto.subtle.importKey("jwk", key, {name: "AES-GCM", length: 256}, true, ["encrypt", "decrypt"]);
}
async function _genAES() {
	return await window.crypto.subtle.generateKey(
		{ name: "AES-GCM"
		, length: 256
		},
		true /* extractable */,
		["encrypt", "decrypt"]
	)
}
async function generateAES() {
	const key = await _genAES();
	return key;
}
async function getAES() {
	const k5 = await getK5();
	var root = await fetchIpfsJ(k5.id);
	if(!root)
		root = { "keys": {} };
	if(root["keys"] && root["keys"][localStorage.getItem("current_key")]) {
		console.log("recovering key " + localStorage.getItem("current_key"));
		const key = await decodeKey(root["keys"][localStorage.getItem("current_key")]);
		return key;
	}
	else {
		const new_key = await generateAES();
		const fpr = await fingerprintKey(new_key);
		localStorage.setItem("current_key", fpr);
		if(!root["keys"])
			root["keys"] = {};
		root["keys"][fpr] = await encodeKey(new_key);
		console.log("adding key " + fpr);
		await postIpnsJ(k5.id, root);
		return new_key;
	}
}
async function getKeys() {
	const k5 = await getK5();
	await getAES();
	const keys_enc = (await fetchIpfsJ(k5.id))["keys"];
	keys_h = {};
	for(k in keys_enc)
		keys_h[k] = await decodeKey(keys_enc[k]);
	return keys_h;
}

async function getK5() {
	if(localStorage.getItem("k5")) {
		return (await document.ipfs.key.list()).find(k => k.id == localStorage.getItem("k5"));
	}
	else {
		var k5 = await document.ipfs.key.gen((await encodeKey(await _genAES()))["k"]);
		localStorage.setItem("k5", k5.id);
		return k5;
	}
}

async function _fprKey(k) {
	const digest = await window.crypto.subtle.digest("SHA-1", (new TextEncoder()).encode(k["k"]));
	// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
	const hash = Array.from(new Uint8Array(digest));
	return hash.map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function fingerprintKey(key) {
	return _fprKey(await encodeKey(key));
}

pgpwords = [
	"aardvark absurd accrue acme adrift adult afflict ahead aimless Algol allow alone ammo ancient apple artist assume Athens atlas Aztec baboon backfield backward basalt beaming bedlamp beehive beeswax befriend Belfast berserk billiard bison blackjack blockade blowtorch bluebird bombast bookshelf brackish breadline breakup brickyard briefcase Burbank button buzzard cement chairlift chatter checkup chisel choking chopper Christmas clamshell classic classroom cleanup clockwork cobra commence concert cowbell crackdown cranky crowfoot crucial crumpled crusade cubic deadbolt deckhand dogsled dosage dragnet drainage dreadful drifter dropper drumbeat drunken Dupont dwelling eating edict egghead eightball endorse endow enlist erase escape exceed eyeglass eyetooth facial fallout flagpole flatfoot flytrap fracture fragile framework freedom frighten gazelle Geiger Glasgow glitter glucose goggles goldfish gremlin guidance hamlet highchair hockey hotdog indoors indulge inverse involve island Janus jawbone keyboard kickoff kiwi klaxon lockup merit minnow miser Mohawk mural music Neptune newborn nightbird obtuse offload oilfield optic orca payday peachy pheasant physique playhouse Pluto preclude prefer preshrunk printer profile prowler pupil puppy python quadrant quiver quota ragtime ratchet rebirth reform regain reindeer rematch repay retouch revenge reward rhythm ringbolt robust rocker ruffled sawdust scallion scenic scorecard Scotland seabird select sentence shadow showgirl skullcap skydive slingshot slothful slowdown snapline snapshot snowcap snowslide solo spaniel spearhead spellbind spheroid spigot spindle spoilage spyglass stagehand stagnate stairway standard stapler steamship stepchild sterling stockman stopwatch stormy sugar surmount suspense swelter tactics talon tapeworm tempest tiger tissue tonic tracker transit trauma treadmill Trojan trouble tumor tunnel tycoon umpire uncut unearth unwind uproot upset upshot vapor village virus Vulcan waffle wallet watchword wayside willow woodlark Zulu".split(" "),
	"adroitness adviser aggregate alkali almighty amulet amusement antenna applicant Apollo armistice article asteroid Atlantic atmosphere autopsy Babylon backwater barbecue belowground bifocals bodyguard borderline bottomless Bradbury Brazilian breakaway Burlington businessman butterfat Camelot candidate cannonball Capricorn caravan caretaker celebrate cellulose certify chambermaid Cherokee Chicago clergyman coherence combustion commando company component concurrent confidence conformist congregate consensus consulting corporate corrosion councilman crossover cumbersome customer Dakota decadence December decimal designing detector detergent determine dictator dinosaur direction disable disbelief disruptive distortion divisive document embezzle enchanting enrollment enterprise equation equipment escapade Eskimo everyday examine existence exodus fascinate filament finicky forever fortitude frequency gadgetry Galveston getaway glossary gossamer graduate gravity guitarist hamburger Hamilton handiwork hazardous headwaters hemisphere hesitate hideaway holiness hurricane hydraulic impartial impetus inception indigo inertia infancy inferno informant insincere insurgent integrate intention inventive Istanbul Jamaica Jupiter leprosy letterhead liberty maritime matchmaker maverick Medusa megaton microscope microwave midsummer millionaire miracle misnomer molasses molecule Montana monument mosquito narrative nebula newsletter Norwegian October Ohio onlooker opulent Orlando outfielder Pacific pandemic pandora paperweight paragon paragraph paramount passenger pedigree Pegasus penetrate perceptive performance pharmacy phonetic photograph pioneer pocketful politeness positive potato processor prophecy provincial proximate puberty publisher pyramid quantity racketeer rebellion recipe recover repellent replica reproduce resistor responsive retraction retrieval retrospect revenue revival revolver Sahara sandalwood sardonic Saturday savagery scavenger sensation sociable souvenir specialist speculate stethoscope stupendous supportive surrender suspicious sympathy tambourine telephone therapist tobacco tolerance tomorrow torpedo tradition travesty trombonist truncated typewriter ultimate undaunted underfoot unicorn unify universe unravel upcoming vacancy vagabond versatile vertigo Virginia visitor vocalist voyager warranty Waterloo whimsical Wichita Wilmington Wyoming yesteryear Yucatan".split(" ")
];

function phraseFingerprint(fpr) {
	var x = [];
	for(let i = 0; i < fpr.length; i += 4) {
		x.push(pgpwords[0][parseInt(fpr.substr(i, 2), 16)]);
		x.push(pgpwords[1][parseInt(fpr.substr(i + 2, 2), 16)]);
	}
	return x.join(" ");
}

async function encrypt(message) {
	const key = await getAES();
	const iv = window.crypto.getRandomValues(new Uint8Array(12));
	if (JSON.parse(JSON.stringify(message)) == message)
		message = await (new TextEncoder()).encode(JSON.stringify(message));
	else if(message.arrayBuffer)
		message = await message.arrayBuffer();
	const encrypted = {
		alg: {name:"AES-GCM", length: 256},
		keyfpr: await fingerprintKey(key),
		iv: Array.from(new Uint8Array(iv)),
		encdata: Array.from(new Uint8Array(await window.crypto.subtle.encrypt( {name: "AES-GCM", iv: iv}, key, message )))
	};
	return encrypted;
}
async function decrypt(message, key = null, decode = true) {
	if(message.alg.name != "AES-GCM" || message.alg.length != 256) {
		return null;
	}
	if (!key)
		key = (await getKeys())[message["keyfpr"]];
	const data = await window.crypto.subtle.decrypt( {name: "AES-GCM", iv: (new Uint8Array(message["iv"])).buffer }, key, (new Uint8Array(message["encdata"])).buffer );
	try {
		if(decode)
			return JSON.parse((new TextDecoder()).decode(data));
	}
	catch {
	}
	return data;
}

