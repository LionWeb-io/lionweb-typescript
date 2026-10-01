import type JSZip from "jszip"

import type { LoadedSnapshot, SnapshotEntry } from "./types.js"

/** Where an entry was read from: lets saving copy it as stored, without encoding or compressing it again. */
export type EntrySource = {
    zip: JSZip
    path: string
}

// Kept beside the loaded objects, which stay plain (cloneable, comparable) data.
const entrySources = new WeakMap<SnapshotEntry, EntrySource>()
const snapshotZips = new WeakMap<LoadedSnapshot, JSZip>()

export const recordEntrySource = (entry: SnapshotEntry, source: EntrySource) => {
    entrySources.set(entry, source)
}

export const entrySourceOf = (entry: SnapshotEntry): EntrySource | undefined => entrySources.get(entry)

export const recordSnapshotZip = (snapshot: LoadedSnapshot, zip: JSZip) => {
    snapshotZips.set(snapshot, zip)
}

export const snapshotZipOf = (snapshot: LoadedSnapshot): JSZip | undefined => snapshotZips.get(snapshot)
