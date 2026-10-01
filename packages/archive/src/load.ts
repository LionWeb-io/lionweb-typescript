import type { LionWebJsonChunk } from "@lionweb/json"
import JSZip from "jszip"

import { decodeChunk } from "./protobuf.js"
import { recordEntrySource, recordArchiveZip } from "./sources.js"
import type { LoadedArchive, LoadProgress, ArchiveDiagnostic, ArchiveEntry, ChunkFormat } from "./types.js"
import { validateChunk } from "./validation.js"

/** The path of the metadata of a LionWeb Archive, matched case-insensitively (as LionWeb Java does). */
export const lwaMetadataPath = "metadata/metadata.properties"
export const lwaVersionKey = "LionWeb-Version"

export type LoadOptions = {
    /** Called before the first chunk and after each chunk entry. */
    onProgress?: (progress: LoadProgress) => void
    /** Whether to check the structure of each chunk, reporting invalid ones as errors. Default: true. */
    validate?: boolean
}

const formatOf = (path: string): ChunkFormat | undefined => (/\.json$/i.test(path) ? "json" : /\.binpb$/i.test(path) ? "binpb" : undefined)

/** Parses the subset of the Java properties format used by LionWeb Java's metadata: `key=value` (or `key: value`) lines and comments. */
export const parseProperties = (text: string): Map<string, string> => {
    const properties = new Map<string, string>()
    for (const rawLine of text.split(/\r?\n/)) {
        const line = rawLine.trim()
        if (line === "" || line.startsWith("#") || line.startsWith("!")) {
            continue
        }
        const match = /^([^=:\s]+)\s*[=:\s]\s*(.*)$/.exec(line)
        if (match) {
            properties.set(match[1], match[2])
        }
    }
    return properties
}

/**
 * Loads an archive of LionWeb chunks, in the `snapshot` layout or a LionWeb Archive (see {@link ArchiveLayout}),
 * recognized by the presence of the metadata of a LionWeb Archive.
 * Entries that cannot be read are skipped and reported in the diagnostics; an input that is not a ZIP is an error.
 */
export async function loadArchive(data: ArrayBuffer | Uint8Array | Blob, options: LoadOptions = {}): Promise<LoadedArchive> {
    const validate = options.validate ?? true
    const zip = await JSZip.loadAsync(data)
    const files = Object.values(zip.files).filter(file => !file.dir)
    const diagnostics: ArchiveDiagnostic[] = []

    const metadataFile = files.find(file => file.name.toLowerCase() === lwaMetadataPath)
    const layout = metadataFile ? "lwa" : "snapshot"
    let lionWebVersion: string | undefined
    if (metadataFile) {
        lionWebVersion = parseProperties(await metadataFile.async("text")).get(lwaVersionKey)
        if (lionWebVersion === undefined) {
            diagnostics.push({
                severity: "warning",
                entry: metadataFile.name,
                message: `No ${lwaVersionKey} property in the archive metadata`
            })
        }
    }

    const roleOf = (path: string): "language" | "partition" | undefined => {
        if (formatOf(path) === undefined) {
            return undefined
        }
        if (layout === "snapshot") {
            return "partition"
        }
        return path.startsWith("languages/") ? "language" : path.startsWith("partitions/") ? "partition" : undefined
    }
    const chunkFiles = files.filter(file => roleOf(file.name) !== undefined)
    const otherFiles = files.filter(file => file !== metadataFile && roleOf(file.name) === undefined).map(file => file.name)

    const languages: ArchiveEntry[] = []
    const partitions: ArchiveEntry[] = []
    let processed = 0
    options.onProgress?.({ processed, total: chunkFiles.length })
    for (const file of chunkFiles) {
        const format = formatOf(file.name)!
        try {
            const chunk: unknown = format === "json" ? JSON.parse(await file.async("text")) : decodeChunk(await file.async("uint8array"))
            if (validate) {
                validateChunk(chunk)
            }
            const entry: ArchiveEntry = { name: file.name, format, chunk: chunk as LionWebJsonChunk }
            recordEntrySource(entry, { zip, path: file.name })
            ;(roleOf(file.name) === "language" ? languages : partitions).push(entry)
            if (lionWebVersion !== undefined && entry.chunk.serializationFormatVersion !== lionWebVersion) {
                diagnostics.push({
                    severity: "warning",
                    entry: file.name,
                    message: `Serialization format version ${entry.chunk.serializationFormatVersion} differs from the archive's ${lwaVersionKey} ${lionWebVersion}`
                })
            }
        } catch (error) {
            diagnostics.push({ severity: "error", entry: file.name, message: error instanceof Error ? error.message : String(error) })
        }
        processed++
        options.onProgress?.({ processed, total: chunkFiles.length, currentEntry: file.name })
    }

    const archive: LoadedArchive = {
        layout,
        ...(lionWebVersion !== undefined ? { lionWebVersion } : {}),
        languages,
        partitions,
        otherFiles,
        diagnostics
    }
    recordArchiveZip(archive, zip)
    return archive
}
