# Design document

Omnilingo is a design and protocol for the communication of
software for language learning.

We sometimes abuse terminology and use Omnilingo to refer to the
reference implementations of these programs and protocols.

## Components

three components:

- storage
- userdata
- client

The expectation is that there will be many implementations of
all components.

Storage:

- backend
- essentially a static data store
- serves audio clips, transcriptions, indexes of these, and some
  pregenerated useful metadata (e.g. metrics useful for calculating difficulty) as a substitute for a real database
- pregenerated and static-only so that we can have:
  - files hosted on an http server, with no config requirements on the
    server
  - files hosted locally to the client
- exploit content-based addressing, and ipfs (optionally)

Userdata:

- backend
- dynamic storage of "private" userdata
- remembers the questions a user has seen, how they performed
- potentially sensitive
- want the following kinds of uses:
  - local, running side-by-side with the client
  - remote, administered by the user
  - remote, run by some community?

Client:

- frontend
- able to connect to many storage and userdata services
- downloads data from storage and userdata to decide about questions
  to present to the user
- client defines the algorithms for next problem selection
- client even defines the problem types!
- uploads results back to userdata
- some thoughts on what data is exactly sent to userdata by clients:
  - respect client privacy: functional without any userdata
  - support some form of opt-in metrics
  - support some form of data recovery
- rolling key system?
  - client has an active key
  - signs all userdata with it, but both pub and priv keys kept secret
    (so without the pubkey records cannot be correlated)
  - opt-in metrics: give verification key to researchers
  - opt-out of future contributions to metrics: switch to a new key
  - data recovery: filter all remote userdata to find those you have
    signed with any key

Envisioned stories:

- omnilingo-on-a-usb-key: webapp client with builtin userdata engine and
  local file storage
- omnilingo-on-someone-elses-computer: any client connects to userdata
  and storage on a publically hosted instance
- omnilingo private community: userdata and storage hosted on a
  private instance; authentication handled "somewhere else"
- multi-language learner: any client connects to multiple storage
  services, one for each language
- pooling language learner: any client connects to multiple storage
  serivces, all for the same language; materials are pooled at the
  client
- social learner: any client connects to multiple userdata services,
  submitting their pubkey bound to a pseudonym; the userdata servers
  display leaderboards
- research assistant: client sends their pubkey and userdata address
  to a researcher; researcher downloads all userdata and filters for
  records signed by that key
- regretful research assistant: client rolls their pubkey; they keep
  the old one, but are only signing with their new pubkey. Researcher
  stops being able to find new userdata entries
- ambidextrous learner: multiple clients connect simultaneously to
  userdata; what happens? should be able to easily transfer keys
  between clients, or save them for future use
