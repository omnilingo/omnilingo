class PronunciationTask {

	constructor() {
		// pt:
		// this.textCid = "QmchCkUf7Zt7BWpJJQrPCKtdTnVMNuDCLUJnkEvYDGNqi7";
		//this.modelCid = "QmX2yjYrmLfeSLnJHdfkVmUf6DMHwi5c391y34yM2oPD26";
		//this.audioCid = "QmbvVrpimM3ja9Fgr8mt9KEkpiYZZrTAfDhAb4uc8M9Z79"; // mp3
		// en:
		// this.textCid = "";
		 this.modelCid = "QmXauHFrYZJDCVTkMaVhNdGUeJ1PKSNgpFDGkBNAXGwaZA";
		 //this.audioCid = "QmdGEr6cTLRhttCmnLd8L1e9nQ35FgNmp5QRxjuuKDbS6b"; // wav
		this.audioCid = "QmQMdZNGsLtxC6q9WCkhdiBpTqtctrmhY6HSwiL824mCpi"; // mp3
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
		var bytes = await fetchIpfsB(this.audioCid);
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
	}

}
