import type { LionWebJsonChunk } from "@lionweb/json"

/** How a chunk is stored in an archive: as JSON (`.json`) or as protobuf (`.binpb`). */
export type ChunkFormat = "json" | "binpb"

/**
 * How an archive is organized:
 * - `snapshot`: chunks (`.json` or `.binpb`) anywhere in the ZIP, each a partition, possibly next to other files;
 * - `lwa`: a LionWeb Archive as defined by LionWeb Java, with `metadata/metadata.properties`
 *   (holding the `LionWeb-Version`), languages under `languages/` and partitions under `partitions/`.
 */
export type ArchiveLayout = "snapshot" | "lwa"

/** A chunk stored in an archive. */
export type ArchiveEntry = {
    /** The path of the entry in the archive. */
    name: string
    format: ChunkFormat
    chunk: LionWebJsonChunk
}

export type ArchiveDiagnostic = {
    severity: "error" | "warning"
    message: string
    /** The path of the entry the diagnostic is about, if any. */
    entry?: string
}

export type LoadedArchive = {
    layout: ArchiveLayout
    /** The `LionWeb-Version` of a LionWeb Archive (`lwa`); absent for the `snapshot` layout. */
    lionWebVersion?: string
    /** The language chunks: those under `languages/` in a LionWeb Archive; always empty for the `snapshot` layout. */
    languages: ArchiveEntry[]
    /** The partition chunks. */
    partitions: ArchiveEntry[]
    /** The paths of the other files in the archive, that are not chunks (nor the metadata of a LionWeb Archive). */
    otherFiles: string[]
    /** Problems found while loading: entries that cannot be read are reported here and skipped. */
    diagnostics: ArchiveDiagnostic[]
}

export type LoadProgress = {
    /** The number of chunk entries processed so far. */
    processed: number
    /** The total number of chunk entries. */
    total: number
    /** The path of the entry just processed. */
    currentEntry?: string
}
