import type JSZip from "jszip"

import type { ArchiveEntry, LoadedArchive } from "./types.js"

/** Where an entry was read from, so that saving can copy it as stored, without encoding or compressing it again. */
export type EntrySource = {
    zip: JSZip
    path: string
}

export const entrySources = new WeakMap<ArchiveEntry, EntrySource>()
export const archiveZips = new WeakMap<LoadedArchive, JSZip>()
