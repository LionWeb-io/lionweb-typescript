import type JSZip from "jszip"

import type { ArchiveEntry, LoadedArchive } from "./types.js"

/** Where an entry was read from: lets saving copy it as stored, without encoding or compressing it again. */
export type EntrySource = {
    zip: JSZip
    path: string
}

// Kept beside the loaded objects, which stay plain (cloneable, comparable) data.
export const entrySources = new WeakMap<ArchiveEntry, EntrySource>()
export const archiveZips = new WeakMap<LoadedArchive, JSZip>()
