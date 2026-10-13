# Changelog

## 0.11.0 — not yet released

* Implement support for the LionWeb Archive:
  * Load archives (`loadArchive`), both LionWeb Archives (as also supported by LionWeb Java) and snapshots (ZIP files of chunks, previous version of the archives).
  * Save archives (`saveArchive`) in either layout, copying unchanged partitions as stored.
  * Encode and decode chunks in the protobuf format (`encodeChunk`, `decodeChunk`), optionally omitting empty features.
  * Validate the structure of chunks (`validateChunk`).
