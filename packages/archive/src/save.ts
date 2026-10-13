import type { LionWebJsonChunk } from "@lionweb/json"
import JSZip from "jszip"

import { metadataFor, metadataPath } from "./metadata.js"
import { encodeChunk } from "./protobuf.js"
import { archiveZips, entrySources } from "./sources.js"
import type { ArchiveEntry, ArchiveLayout, LoadedArchive } from "./types.js"

/**
 * A chunk to save: either a new or changed entry, which is encoded, or an entry obtained from {@link loadArchive}
 * to copy as stored (`copy`), without encoding or compressing it again — which is much faster for large archives.
 * The caller guarantees that a copied entry's chunk was not changed since it was loaded.
 * A copied entry can be given another name; it is encoded when it cannot be copied (e.g., when its format must change).
 */
export type ArchiveEntryToSave = ArchiveEntry | { copy: ArchiveEntry; name?: string }

export type SaveOptions<T extends "uint8array" | "blob"> = {
    /** Default: `snapshot`. */
    layout?: ArchiveLayout
    /** The partitions. In the `snapshot` layout, they keep their names (made unique by appending `-2`, `-3`, …). */
    partitions: readonly ArchiveEntryToSave[]
    /**
     * The languages: stored under `languages/` in a LionWeb Archive; in the `snapshot` layout,
     * they are stored as the partitions (before them), since that layout does not distinguish them.
     */
    languages?: readonly ArchiveEntryToSave[]
    /** The `LionWeb-Version` of a LionWeb Archive. Default: the serialization format version of the chunks, which must all be the same. */
    lionWebVersion?: string
    /** Archives whose other files (anything but chunks and metadata) are carried over, unless their names are already used. */
    carryOtherFilesFrom?: readonly LoadedArchive[]
    /** See {@link EncodeOptions}. Default: true for a LionWeb Archive (as LionWeb Java does), false for the `snapshot` layout. */
    omitEmptyFeatures?: boolean
    /** Default: `STORE` (no compression, favoring speed, as LionWeb Java does) for a LionWeb Archive, `DEFLATE` for the `snapshot` layout. */
    compression?: "STORE" | "DEFLATE"
    /** The type of the result. */
    type: T
    /** Called with the percentage of the archive written so far. */
    onProgress?: (percent: number) => void
}

/** The part of JSZip's internal `CompressedObject` (the `_data` of an entry read from a ZIP) that is relied on. */
type CompressedObject = { compressedContent: unknown; compression: { magic: string } }

/**
 * Copies a ZIP entry as stored: JSZip reuses the compressed bytes when the compression method stays the same.
 * This relies on JSZip's internal `_data`, and falls back to decompressing the entry.
 */
const copyFile = (from: JSZip, path: string, to: JSZip, name: string) => {
    const file = from.files[path]
    const data = (file as unknown as { _data?: Partial<CompressedObject> })._data
    if (data?.compressedContent !== undefined && data.compression !== undefined) {
        const compression = data.compression.magic === "\x00\x00" ? "STORE" : "DEFLATE"
        to.file(name, data as never, { binary: true, date: file.date, compression })
    } else {
        to.file(name, file.async("uint8array"), { binary: true, date: file.date })
    }
}

const sourceOf = (entry: ArchiveEntryToSave): ArchiveEntry => ("copy" in entry ? entry.copy : entry)

const rootIdOf = (chunk: LionWebJsonChunk): string => {
    const root = chunk.nodes.find(node => node.parent === null)
    if (root === undefined) {
        throw new Error("Cannot name the entry of a chunk without root node")
    }
    return root.id
}

/**
 * Saves chunks as an archive, in the `snapshot` layout (by default) or as a LionWeb Archive (see {@link ArchiveLayout}).
 * In a LionWeb Archive, all chunks are stored as protobuf, named after their root node.
 */
export const saveArchive = async <T extends "uint8array" | "blob">(
    options: SaveOptions<T>
): Promise<T extends "blob" ? Blob : Uint8Array> => {
    const layout = options.layout ?? "snapshot"
    const lwa = layout === "lwa"
    const omitEmptyFeatures = options.omitEmptyFeatures ?? lwa
    const languages = options.languages ?? []
    const out = new JSZip()

    const used = new Set<string>()
    const unique = (name: string) => {
        let candidate = name
        for (let n = 2; used.has(candidate.toLowerCase()); n++) {
            candidate = name.replace(/(\.[^./]+)?$/, `-${n}$1`)
        }
        used.add(candidate.toLowerCase())
        return candidate
    }

    if (lwa) {
        const versions = new Set([...languages, ...options.partitions].map(entry => sourceOf(entry).chunk.serializationFormatVersion))
        const lionWebVersion = options.lionWebVersion ?? (versions.size === 1 ? [...versions][0] : undefined)
        if (lionWebVersion === undefined) {
            throw new Error(
                versions.size === 0
                    ? "Cannot determine the LionWeb version of an empty archive: specify it"
                    : `Cannot store chunks of different serialization format versions (${[...versions].join(", ")}) in one LionWeb Archive`
            )
        }
        out.file(unique(metadataPath), metadataFor(lionWebVersion))
    }

    const write = (entry: ArchiveEntryToSave, directory: string) => {
        const source = sourceOf(entry)
        const format = lwa ? "binpb" : source.format
        const name = unique(lwa ? `${directory}/${rootIdOf(source.chunk)}.binpb` : (entry.name ?? source.name))
        const stored = "copy" in entry ? entrySources.get(entry.copy) : undefined
        if (stored && format === source.format) {
            copyFile(stored.zip, stored.path, out, name)
        } else {
            out.file(name, format === "binpb" ? encodeChunk(source.chunk, { omitEmptyFeatures }) : JSON.stringify(source.chunk))
        }
    }
    languages.forEach(entry => write(entry, "languages"))
    options.partitions.forEach(entry => write(entry, "partitions"))

    for (const archive of new Set(options.carryOtherFilesFrom ?? [])) {
        const zip = archiveZips.get(archive)
        if (zip !== undefined) {
            archive.otherFiles.filter(path => !used.has(path.toLowerCase())).forEach(path => copyFile(zip, path, out, unique(path)))
        }
    }

    const result = await out.generateAsync(
        { type: options.type, compression: options.compression ?? (lwa ? "STORE" : "DEFLATE"), compressionOptions: { level: 6 } },
        metadata => options.onProgress?.(metadata.percent)
    )
    return result as T extends "blob" ? Blob : Uint8Array
}
