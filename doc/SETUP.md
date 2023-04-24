
Installing OmniLingo is a seven step process:


* Install and set up a local IPFS node
* Clone the [omnilingo-ipfs](https://github.com/omnilingo/omnilingo-ipfs) repository
* Get a dataset from Common Voice, or prepare one in Common Voice format (see [FORMAT](doc/FORMAT.md))
* Import data into IPFS 
* Index data in IPFS 
* Publish index to IPFS 
* Set up HTTP server 
* Serve client code

## Install and set up a local IPFS node

First install Kubo:

https://dist.ipfs.tech/#kubo

```
$ tar -xzvf kubo_v0.19.0_linux-amd64.tar.gz 
kubo/LICENSE
kubo/LICENSE-APACHE
kubo/LICENSE-MIT
kubo/README.md
kubo/install.sh
kubo/ipfs
```

You will need to edit the IPFS config file to add some headers:

```
  "Gateway": {
    "HTTPHeaders": {
      "Access-Control-Allow-Headers": [
        "X-Requested-With",
        "Range",
        "User-Agent"
      ],
      "Access-Control-Allow-Methods": [
        "GET"
      ],
      "Access-Control-Allow-Origin": [
        "*"
      ]
    },
    "RootRedirect": "",
    "Writable": false,
    "PathPrefixes": [],
    "APICommands": [],
    "NoFetch": true,
    "NoDNSLink": false,
    "PublicGateways": null
  },
  "API": {
    "HTTPHeaders": {
      "Access-Control-Allow-Origin": ["*"]
    }
  },
```

```
$ cd kubo
```

Init your IPFS store:
```
$ ./ipfs init
```

Then run the daemon:
```
$ ./ipfs daemon
```

## Clone OmniLingo IPFS repository

Now clone the OmniLingo IPFS repo:

```
git clone https://github.com/omnilingo/omnilingo-ipfs
```

Then cd into that directory:

```
$ cd omnilingo-ipfs
```

## Get a Common Voice dataset

Then get a Common Voice dataset for a language, from https://commonvoice.mozilla.org/datasets


```
$ tar -xzf cv-corpus-13.0-2023-03-09-nn-NO.tar.gz 
```

Make a directory, `indexes/`: 

```
$ mkdir indexes
```

## Import dataset into IPFS 

Import it using the importer.py script:

```
$ ./importer.py cv-corpus-13.0-2023-03-09/nn-NO/ indexes/nn-NO.json
```

The output should look like:

```
cv-corpus-13.0-2023-03-09/nn-NO/ → indexes/nn-NO.json
 74% (559 of 747) |##################################################                    | Elapsed Time: 0:02:25 ETA:   0:00:50
```

## Index data in IPFS 

> Indexing the data means calculating clip durations etc. and extracting a 
> subset of clips that have varying duration (1 to 10 seconds).

Then you run the indexer, the first argument is the locale ID of the langugage and the second 
is the index that the importer created.

```
$ ./indexer.py nn-NO indexes/nn-NO.json 
```

The output should look like:

```
$ ./indexer.py nn-NO indexes/nn-NO.json 
  7% (745 of 10000) |#######                                     | Elapsed Time: 0:01:09 ETA:   0:11:42
 bucket 01 ->    48 ....
 bucket 02 ->   129 ............
 bucket 03 ->   189 ..................
 bucket 04 ->   114 ...........
 bucket 05 ->   106 ..........
 bucket 06 ->    78 .......
 bucket 07 ->    41 ....
 bucket 08 ->    23 ..
 bucket 09 ->    13 .
 bucket 10 ->     4 
Qmc4FVwVkeHPpeV127nDymfZRSNbDWkX9t7WxsBGYjBubg
```

## Publish the index to IPFS

```
$ ./publisher.py nn-NO Qmc4FVwVkeHPpeV127nDymfZRSNbDWkX9t7WxsBGYjBubg
[nn-NO] Norsk (nynorsk) | QmZYwPKT26jJSQKm2HMGakA2GU1wd5HX6nNiHHaX6UMHCS
index: QmeZwKogGakkX3NmerBbQwGtAVgQFSH25vJeRj6rh9iyvA
```

This last CID, `QmeZwKogGakkX3NmerBbQwGtAVgQFSH25vJeRj6rh9iyvA` is very important, it is your 
main index for the OmniLingo client application. Check that you can access it using:

```
$ ./ipfs cat QmeZwKogGakkX3NmerBbQwGtAVgQFSH25vJeRj6rh9iyvA
{"nn-NO":{"cids":["Qmc4FVwVkeHPpeV127nDymfZRSNbDWkX9t7WxsBGYjBubg"],"meta":"QmZYwPKT26jJSQKm2HMGakA2GU1wd5HX6nNiHHaX6UMHCS"}}
```


## Setup an HTTP server 


Next up you need to set up an HTTP server. We recommend `nginx`:

```
$ sudo apt-get install nginx
```

Make the server serve the directory that you have downloaded `omnilingo/client`.

You also need to set up nginx to proxy the IPFS API requests.


```
server {
...

	root /home/fran/source/omnilingo/client;

...

	location /api/v0 {
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_pass http://ipfs;
		proxy_http_version 1.1;
		proxy_set_header Upgrade $http_upgrade;
		proxy_set_header Connection $connection_upgrade;
		proxy_set_header Host $host;
	}
	location / {
		root /home/omnilingo/omnilingo/client;
		add_header 'Cross-Origin-Embedder-Policy' 'require-corp';
		add_header 'Cross-Origin-Opener-Policy' 'same-origin';
		index index.html;
	}
}

upstream ipfs {
	server 127.0.0.1:5001;
}
```

## Configure OmniLingo client


Open up http://localhost/ and click on the cog icon at the top right-hand side.

Paste in the index CID you made: `QmeZwKogGakkX3NmerBbQwGtAVgQFSH25vJeRj6rh9iyvA`.



