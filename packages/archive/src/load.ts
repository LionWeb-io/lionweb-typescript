import type { LionWebJsonChunk } from "@lionweb/json"
import JSZip from "jszip"

import { lionWebVersionIn, lionWebVersionKey, metadataPath } from "./metadata.js"
import { decodeChunk } from "./protobuf.js"
import { archiveZips, entrySources } from "./sources.js"
import type { ArchiveDiagnostic, ArchiveEntry, ChunkFormat, LoadedArchive, LoadProgress } from "./types.js"
import { validateChunk } from "./validation.js"

export type LoadOptions = {
    /** Called before the first chunk and after each chunk entry. */
    onProgress?: (progress: LoadProgress) => void
    /** Whether to check the structure of each chunk, reporting invalid ones as errors. Default: true. */
    validate?: boolean
}

const formatOf = (path: string): ChunkFormat | undefined => (/\.json$/i.test(path) ? "json" : /\.binpb$/i.test(path) ? "binpb" : undefined)

/**
 * Loads an archive of LionWeb chunks, in the `snapshot` layout or a LionWeb Archive (see {@link ArchiveLayout}),
 * recognized by the presence of the metadata of a LionWeb Archive.
 * Entries that cannot be read are skipped and reported in the diagnostics; an input that is not a ZIP is an error.
 */
export const loadArchive = async (data: ArrayBuffer | Uint8Array | Blob, options: LoadOptions = {}): Promise<LoadedArchive> => {
    const validate = options.validate ?? true
    const zip = await JSZip.loadAsync(data)
    const files = Object.values(zip.files).filter(file => !file.dir)
    const diagnostics: ArchiveDiagnostic[] = []

    const metadataFile = files.find(file => file.name.toLowerCase() === metadataPath)
    const layout = metadataFile ? "lwa" : "snapshot"
    const lionWebVersion = metadataFile === undefined ? undefined : lionWebVersionIn(await metadataFile.async("text"))
    if (metadataFile !== undefined && lionWebVersion === undefined) {
        diagnostics.push({
            severity: "warning",
            entry: metadataFile.name,
            message: `No ${lionWebVersionKey} property in the archive metadata`
        })
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
        const entries = roleOf(file.name) === "language" ? languages : partitions
        try {
            const chunk: unknown = format === "json" ? JSON.parse(await file.async("text")) : decodeChunk(await file.async("uint8array"))
            if (validate) {
                validateChunk(chunk)
            }
            const entry: ArchiveEntry = { name: file.name, format, chunk: chunk as LionWebJsonChunk }
            entrySources.set(entry, { zip, path: file.name })
            entries.push(entry)
            if (lionWebVersion !== undefined && entry.chunk.serializationFormatVersion !== lionWebVersion) {
                diagnostics.push({
                    severity: "warning",
                    entry: file.name,
                    message: `Serialization format version ${entry.chunk.serializationFormatVersion} differs from the archive's ${lionWebVersionKey} ${lionWebVersion}`
                })
            }
        } catch (error) {
            diagnostics.push({ severity: "error", entry: file.name, message: error instanceof Error ? error.message : String(error) })
        }
        processed++
        options.onProgress?.({ processed, total: chunkFiles.length, currentEntry: file.name })
    }

    const archive: LoadedArchive = { layout, lionWebVersion, languages, partitions, otherFiles, diagnostics }
    archiveZips.set(archive, zip)
    return archive
}
