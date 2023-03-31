
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

```
$ cd kubo
$ ./ipfs daemon
```

## Clone OmniLingo IPFS repository

Now clone the OmniLingo IPFS repo:

```
git clone https://github.com/omnilingo/omnilingo-ipfs
```

## Get a Common Voice dataset

Then get a Common Voice dataset for a language, from https://commonvoice.mozilla.org//datasets


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

