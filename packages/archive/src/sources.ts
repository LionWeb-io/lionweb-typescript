import type JSZip from "jszip"

import type { LoadedArchive, ArchiveEntry } from "./types.js"

/** Where an entry was read from: lets saving copy it as stored, without encoding or compressing it again. */
export type EntrySource = {
    zip: JSZip
    path: string
}

// Kept beside the loaded objects, which stay plain (cloneable, comparable) data.
const entrySources = new WeakMap<ArchiveEntry, EntrySource>()
const archiveZips = new WeakMap<LoadedArchive, JSZip>()

export const recordEntrySource = (entry: ArchiveEntry, source: EntrySource) => {
    entrySources.set(entry, source)
}

export const entrySourceOf = (entry: ArchiveEntry): EntrySource | undefined => entrySources.get(entry)

export const recordArchiveZip = (archive: LoadedArchive, zip: JSZip) => {
    archiveZips.set(archive, zip)
}

export const archiveZipOf = (archive: LoadedArchive): JSZip | undefined => archiveZips.get(archive)
