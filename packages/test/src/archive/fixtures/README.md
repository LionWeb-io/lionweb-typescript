# Test fixtures

- `bobslibrary.json` and `library-language.json` are copied from the test resources of [LionWeb Java](https://github.com/LionWeb-io/lionweb-java) (`core/src/test/resources/serialization`).
- The files in `jvm/` were produced from them by LionWeb Java 1.4.1, to check compatibility with it:
  - `bobslibrary.binpb`: `bobslibrary.json` serialized with `SerializationProvider.getEfficientProtoBufSerialization(LionWebVersion.v2023_1)`.
  - `bobslibrary.lwa`: a LionWeb Archive written by `LionWebArchive.store`, with `library-language.json` as language and `bobslibrary.json` as partition.
