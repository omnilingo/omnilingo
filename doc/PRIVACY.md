# Privacy

For a language learning app, obviously data about users and about how their language learning is progressing
can be very useful. For example, we might want to know what a person's L1s are or L2s are in order to better
tailor the examples for them.

However, we should be ever vigilant that this data can be used do deanonymise people. For example, if
someone were to try and enumerate all the people in the world who speak {English, Catalan, Spanish, Russian,
French, Norwegian} and who live in the United States, then I think the enumeration would be countable on ones
fingers.

So, some principles:

- **Offline first**
  - We should store as much as possible in the learner's browser.
  - We should also make it possible for learners to download their data in a text-based format, kind of like
    a locally stored profile.
- **Opt in remote storage**
  - We should allow remote storage, but only opt in. We should find a way to make it encrypted so that we can
    can't see the data directly.
- **Opt in aggregate analytics**
  - We want to be able to collect information like "N users with English as a native language wrote *плошад* instead of *площадь* in this sentence"
  - Each piece of information should be counted and aggregated, they should not be cross-referenceable.

These are some ideas to make our software ethical. Comments welcome.
