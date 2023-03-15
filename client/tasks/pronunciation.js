class PronunciationTask {

	constructor() {
		// pt:
		// this.textCid = "QmchCkUf7Zt7BWpJJQrPCKtdTnVMNuDCLUJnkEvYDGNqi7";
		//this.modelCid = "QmX2yjYrmLfeSLnJHdfkVmUf6DMHwi5c391y34yM2oPD26";
		//this.audioCid = "QmbvVrpimM3ja9Fgr8mt9KEkpiYZZrTAfDhAb4uc8M9Z79"; // mp3
		// en:
		// this.textCid = "";
		 this.modelCid = "QmXauHFrYZJDCVTkMaVhNdGUeJ1PKSNgpFDGkBNAXGwaZA";
		this.audioCid = "QmdGEr6cTLRhttCmnLd8L1e9nQ35FgNmp5QRxjuuKDbS6b"; // wav
		//this.audioCid = "QmQMdZNGsLtxC6q9WCkhdiBpTqtctrmhY6HSwiL824mCpi"; // mp3
		console.log("[PronunciationTask] " );
	        STT().then(module => {
	            this.stt = module;
	
	            // Now that we know the WASM module is ready, enable
	            // the file picker for the model.
	            //const input = document.getElementById("modelpicker");
	            //input.addEventListener("change", (e) => loadModel(e.target.files), false);
	            //input.disabled = false;

	        });

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
	    console.log("Minimum Penalty in " + "aligning the genes = " + dp[m][n]);
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

        loadModel  = async () =>  {
            console.log(`Loading model`, this.modelCid);
		var bytes = await fetchIpfsB(this.modelCid);
		console.log('[model] Length: ' + bytes.length)
                this.activeModel = new this.stt.Model(new Uint8Array(bytes));
                const modelSampleRate = this.activeModel.getSampleRate();
                console.log("[model] Model sample rate: " + modelSampleRate);

		this.processAudio();

        };

        processAudio = async () => {
            console.log(`Loading audio file`, this.audioCid);
		var bytesB = await fetchIpfsB(this.audioCid);
		console.log(bytesB)
		var bytes = this.converFloat32ToInt16(bytesB);
		console.log(bytes)
		console.log('[audio] Length: ' + bytes.length)
                    const toPass = new this.stt.VectorShort();
                    bytes.forEach(e => toPass.push_back(e));

                    const now = Date.now();
		     console.log('Running model: ' + now);
                    //const result = this.activeModel.speechToTextWithMetadata(toPass, 5);
                    const result = this.activeModel.speechToText(toPass) ;
                    const elapsedSeconds = (Date.now() - now)/1000;

                    console.log("Transcription: ")
			console.log(result);
                    console.log("Elapsed seconds: " + elapsedSeconds);

        };

	runTask() {
//			this.processAudio();
var res =		this.getMinimumPenalty("this is a test", "thiz i za test",  1,  1);
			console.log(res);
		var text = "";
		for(var i = 0; i < res.length; i++) {
			if (res[i][1] == 0) {
			text += '<span style="color: red">' + res[i][0] + '</span>';
			} else {
			text += '<span style="color: black">' + res[i][0] + '</span>';

			}
		}
	const result= document.getElementById("resultat");
		result.innerHTML = text;

	}


}
