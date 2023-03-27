class PronunciationTask extends Task {

	constructor(question) {
		super(question);

		console.log("[PronunciationTask] " + question.sentenceCid);
		console.log(' Transcript: ' + this.sentenceText);
		//
		// pt:
		// this.sentenceCid = "QmchCkUf7Zt7BWpJJQrPCKtdTnVMNuDCLUJnkEvYDGNqi7";
		//this.audioCid = "QmbvVrpimM3ja9Fgr8mt9KEkpiYZZrTAfDhAb4uc8M9Z79"; // mp3
		//this.audioCid = "QmRVsDK629Tr6DY29u4xQPUgCuYQwfVH4B7u67sCGrczEN"; // mp3
		// en:
		// this.sentenceCid = "";
		// this.modelCid = "QmXauHFrYZJDCVTkMaVhNdGUeJ1PKSNgpFDGkBNAXGwaZA";
		//this.audioCid = "QmdGEr6cTLRhttCmnLd8L1e9nQ35FgNmp5QRxjuuKDbS6b"; // wav
		//this.audioCid = "QmQMdZNGsLtxC6q9WCkhdiBpTqtctrmhY6HSwiL824mCpi"; // mp3

	}

	initTask = async() => {
		await this.initActivity();
		await this.fetchData();
	}
	init = async() => {
		await this.initTask();
	}

	cleanup() {
		console.log('[PronunciationTask] cleanup()');
		const result = document.getElementById("resultat");
		result.innerHTML = "";
	}


		//JavaScript equivalent
	// function to find out
	// the minimum penalty
	getMinimumPenalty(x, y, pxy, pgap) {
		 console.log("get minimum:")
		console.log('x:' + x);
			console.log('y:' + y);
	    let i, j; // initialising variables
	
	    let m = x.length; // length of gene1
	    let n = y.length; // length of gene2
	
	    // table for storing optimal
	    // substructure answers
	    let dp = new Array(n + m + 1).fill().map(() => new Array(n + m + 1).fill(0));
	
	    // initialising the table
	    for (i = 0; i <= (n + m); i++)
	    {
	        dp[i][0] = i * pgap;
	        dp[0][i] = i * pgap;
	    }
	
	    // calculating the
	    // minimum penalty
	    for (i = 1; i <= m; i++)
	    {
	        for (j = 1; j <= n; j++)
	        {
	            if (x.charAt(i - 1) == y.charAt(j - 1))
	            {
	                dp[i][j] = dp[i - 1][j - 1];
	            }
	            else
	            {
	                dp[i][j] = Math.min(Math.min(dp[i - 1][j - 1] + pxy ,
	                                             dp[i - 1][j] + pgap) ,
	                                             dp[i][j - 1] + pgap );
	            }
	        }
	    }
	
	    // Reconstructing the solution
	    let l = n + m; // maximum possible length
	
	    i = m; j = n;
	
	    let xpos = l;
	    let ypos = l;
	
	    // Final answers for
	    // the respective strings
	    let xans = new Array(l + 1);
	    let yans = new Array(l + 1);
	
	    while ( !(i == 0 || j == 0))
	    {
	        if (x.charAt(i - 1) == y.charAt(j - 1))
	        {
	            xans[xpos--] = x.charCodeAt(i - 1);
	            yans[ypos--] = y.charCodeAt(j - 1);
	            i--; j--;
	        }
	        else if (dp[i - 1][j - 1] + pxy == dp[i][j])
	        {
	            xans[xpos--] = x.charCodeAt(i - 1);
	            yans[ypos--] = '_'.charCodeAt(0);
	            i--; j--;
	        }
	        else if (dp[i - 1][j] + pgap == dp[i][j])
	        {
	            xans[xpos--] = x.charCodeAt(i - 1);
	            yans[ypos--] = '_'.charCodeAt(0);
	            i--;
	        }
	        else if (dp[i][j - 1] + pgap == dp[i][j])
	        {
	            xans[xpos--] = '_'.charCodeAt(0);
	            yans[ypos--] = y.charCodeAt(j - 1);
	            j--;
	        }
	    }
	    while (xpos > 0)
	    {
	        if (i > 0) xans[xpos--] = x.charCodeAt(--i);
	        else xans[xpos--] = '_'.charCodeAt(0);
	    }
	    while (ypos > 0)
	    {
	        if (j > 0) yans[ypos--] = y.charCodeAt(--j);
	        else yans[ypos--] = '_'.charCodeAt(0);
	    }
	
	    // Since we have assumed the
	    // answer to be n+m long,
	    // we need to remove the extra
	    // gaps in the starting id
	    // represents the index from
	    // which the arrays xans,
	    // yans are useful
	    let id = 1;
	    for (i = l; i >= 1; i--)
	    {
	        if (String.fromCharCode(yans[i]) == '_' &&
	            String.fromCharCode(xans[i]) == '_')
	        {
	            id = i + 1;
	            break;
	        }
	    }
	
	    // Printing the final answer
	    console.log("Minimum Penalty = " + dp[m][n]);
	    console.log("The alignment is:");
	    var xtemp="";
	    for (i = id; i <= l; i++)
	    {
	    xtemp=xtemp+String.fromCharCode(xans[i]);
	    }
	    console.log(xtemp);
	    var ytemp="";
	    for (i = id; i <= l; i++)
	    {
	     ytemp=ytemp+String.fromCharCode(yans[i]);
	    }
	    console.log(ytemp);
	var res = [];
		console.log('xtemp: ' + xtemp)
		for(i = 0; i < xtemp.length; i++) {
			var elem = [];
			if (xtemp[i] == ytemp[i]){
				elem = [xtemp[i], 1]
			}else{
				elem = [xtemp[i], 0]
			}
			res.push(elem);
		}


	    return res;
	}


        // https://stackoverflow.com/q/33738873/261698
        converFloat32ToInt16(buffer) {
            return Int16Array.from(buffer, x => x * 32767);
        }

	evaluate = async (audioCid) => {
		console.log('[PronunciationTask] evaluate() ' + audioCid);
		console.log(' Transcript: ' + this.sentenceText);
		var acousticModelOutput = await this.processAudio(audioCid);
		var res = this.getMinimumPenalty(this.sentenceText.toLowerCase(), acousticModelOutput, 1, 1);
		console.log(res);
		var text = "";
		var buffer = "";
		var lenMismatch = 0;
		for(var i = 0; i < res.length; i++) {
			if (res[i][1] == 0) {
				lenMismatch += 1;
				buffer += res[i][0];
			} else {
				if(buffer.length > 0) {
					text += '<span style="color: ' + this.chooseColour(lenMismatch) + '">' + buffer + '</span>';
					buffer = "";
				}
				text += '<span style="color: black">' + res[i][0] + '</span>';
				lenMismatch = 0;
			}
		}
		if(buffer.length > 0) {
			text += '<span style="color: ' + this.chooseColour(lenMismatch) + '">' + buffer + '</span>';
		}
		const result = document.getElementById("resultat");
		result.innerHTML = text;
	}

        processAudio = async (audioCid) => {
		console.log('[PronunciationTask] processAudio() ' + audioCid);
		var bytes = await fetchIpfsB(audioCid);
		console.log(bytes)
		console.log('[audio] Length: ' + bytes.length)
		var decodedAudio = await document.omnilingo.audioContext.decodeAudioData(bytes.buffer);
		const processedAudio = this.converFloat32ToInt16(decodedAudio.getChannelData(0));
		// Convert the `processedAudio` to something that can be passed
		// across the WASM boundaries.
		const toPass = new document.omnilingo.stt.VectorShort();
		processedAudio.forEach(e => toPass.push_back(e));

		const now = Date.now();
		console.log('Running model: ' + now);

		const result = document.omnilingo.acousticModel.speechToText(toPass) ;

		const elapsedSeconds = (Date.now() - now)/1000;
		console.log("Transcription: ")
		console.log(result);
		console.log("Elapsed seconds: " + elapsedSeconds);

		return result;

        };

	buildTbox() {
		var tb = "<span>";
		for(var i = 0; i < this.tokens.length; i++) {
			tb += this.tokens[i] + " ";
		}
		return tb +  "</span>";
	}

	run = async() => {
		//console.log("[BlankTask] run()");

		await this.init();

		var tbox = document.getElementById("pronSource");
		if(tbox)
			tbox.innerHTML = this.buildTbox();

		this.setRunning(true);
	}

	runTask() {
//			this.processAudio();
	var orig = "o ar fresco dos anúncios do conselho já estava circulando pelo mundo" ;
		var asr = "o afresca do sanuns cias tocos serio e aistara circorando a para muniã";
var res =		this.getMinimumPenalty(orig, asr, 1, 1);
			console.log(res);
		var text = "";
		var buffer = "";
		var lenMismatch = 0;
		for(var i = 0; i < res.length; i++) {
			if (res[i][1] == 0) {
				lenMismatch += 1;
				buffer += res[i][0];
			} else {
				if(buffer.length > 0) {
					text += '<span style="color: ' + this.chooseColour(lenMismatch) + '">' + buffer + '</span>';
					buffer = "";
				}
				text += '<span style="color: black">' + res[i][0] + '</span>';
				lenMismatch = 0;
			}
		}
		if(buffer.length > 0) {
			text += '<span style="color: ' + this.chooseColour(lenMismatch) + '">' + buffer + '</span>';
		}
	const result= document.getElementById("resultat");
		result.innerHTML = text;
	const source = document.getElementById("pronSource");
		source.innerHTML = orig;

	}


	chooseColour(n) {

		if(n == 1) {
			return "#990000";
		}else if(n == 2) {
			return "#cc0000";
		}
		return "#ff0000";
	}

}
