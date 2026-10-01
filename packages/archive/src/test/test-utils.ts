import type { LionWebJsonChunk } from "@lionweb/json"
import { readFileSync } from "fs"
import JSZip from "jszip"

export const readBytes = (path: string): Uint8Array => new Uint8Array(readFileSync(path))
const readJson = (path: string): LionWebJsonChunk => JSON.parse(readFileSync(path).toString())

// The fixtures copied from LionWeb Java -- see test-fixtures/README.md:
export const bobsLibrary = readJson("test-fixtures/bobslibrary.json")
export const libraryLanguage = readJson("test-fixtures/library-language.json")

/** What remains of a chunk once empty features are omitted, as LionWeb Java does in its archives. */
export const withoutEmptyFeatures = (chunk: LionWebJsonChunk): LionWebJsonChunk => ({
    ...chunk,
    nodes: chunk.nodes.map(node => ({
        ...node,
        properties: node.properties.filter(property => property.value !== null),
        containments: node.containments.filter(containment => containment.children.length > 0),
        references: node.references.filter(reference => reference.targets.length > 0)
    }))
})

/** @return the bytes of a ZIP with the given files. */
export const zipOf = async (files: Record<string, string | Uint8Array>): Promise<Uint8Array> => {
    const zip = new JSZip()
    Object.entries(files).forEach(([path, content]) => zip.file(path, content))
    return zip.generateAsync({ type: "uint8array", compression: "DEFLATE" })
}

/** @return the names of the files in the given ZIP. */
export const fileNamesIn = async (data: Uint8Array): Promise<string[]> =>
    Object.values((await JSZip.loadAsync(data)).files)
        .filter(file => !file.dir)
        .map(file => file.name)

/** @return the text of the given file in the given ZIP. */
export const textOfFileIn = async (data: Uint8Array, path: string): Promise<string> =>
    (await JSZip.loadAsync(data)).file(path)!.async("text")
