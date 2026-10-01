import { LionWebJsonChunk } from "@lionweb/json"
import { assert } from "chai"
import { readFileSync } from "fs"
import JSZip from "jszip"

import { encodeChunk, loadArchive, saveArchive } from "../index.js"

const { deepEqual, equal } = assert

const readJson = (path: string): LionWebJsonChunk => JSON.parse(readFileSync(path).toString())
const bobsLibrary = readJson("test-fixtures/bobslibrary.json")
const libraryLanguage = readJson("test-fixtures/library-language.json")

const withoutEmptyFeatures = (chunk: LionWebJsonChunk): LionWebJsonChunk => ({
    ...chunk,
    nodes: chunk.nodes.map(node => ({
        ...node,
        properties: node.properties.filter(property => property.value !== null),
        containments: node.containments.filter(containment => containment.children.length > 0),
        references: node.references.filter(reference => reference.targets.length > 0)
    }))
})

const zipOf = async (files: Record<string, string | Uint8Array>): Promise<Uint8Array> => {
    const zip = new JSZip()
    Object.entries(files).forEach(([path, content]) => zip.file(path, content))
    return zip.generateAsync({ type: "uint8array", compression: "DEFLATE" })
}

const fileNames = async (data: Uint8Array) =>
    Object.values((await JSZip.loadAsync(data)).files)
        .filter(file => !file.dir)
        .map(file => file.name)

describe("saving of archives", () => {
    it("saves an archive in the snapshot layout that loads back the same", async () => {
        const original = await loadArchive(
            await zipOf({
                "library.json": JSON.stringify(bobsLibrary),
                "language.binpb": encodeChunk(libraryLanguage),
                "README.md": "# Hi"
            })
        )
        const saved = await saveArchive({
            partitions: original.partitions.map(partition => ({ copy: partition })),
            carryOtherFilesFrom: [original],
            type: "uint8array"
        })
        const reloaded = await loadArchive(saved)
        equal(reloaded.layout, "snapshot")
        deepEqual(reloaded.partitions, original.partitions)
        deepEqual(reloaded.otherFiles, ["README.md"])
        equal(await (await JSZip.loadAsync(saved)).file("README.md")!.async("text"), "# Hi")
    })

    it("copies the stored bytes of copied partitions, and encodes the others", async () => {
        const original = await loadArchive(await zipOf({ "a.binpb": encodeChunk(bobsLibrary), "b.json": JSON.stringify(bobsLibrary) }))
        // Changing a chunk after loading it breaks the contract of copying: it shows which partitions are copied.
        original.partitions.forEach(partition => (partition.chunk.nodes[0].id = "changed"))
        const [a, b] = original.partitions
        const reloaded = await loadArchive(await saveArchive({ partitions: [{ copy: a }, b], type: "uint8array" }), { validate: false })
        equal(reloaded.partitions[0].chunk.nodes[0].id, "bl")
        equal(reloaded.partitions[1].chunk.nodes[0].id, "changed")
    })

    it("encodes new partitions in their format, keeping empty features by default", async () => {
        const saved = await saveArchive({
            partitions: [
                { name: "library.binpb", format: "binpb", chunk: bobsLibrary },
                { name: "language.json", format: "json", chunk: libraryLanguage }
            ],
            type: "uint8array"
        })
        const reloaded = await loadArchive(saved)
        deepEqual(reloaded.partitions, [
            { name: "library.binpb", format: "binpb", chunk: bobsLibrary },
            { name: "language.json", format: "json", chunk: libraryLanguage }
        ])
    })

    it("makes names unique, and renames copied partitions when asked", async () => {
        const original = await loadArchive(await zipOf({ "library.json": JSON.stringify(bobsLibrary) }))
        const [library] = original.partitions
        const saved = await saveArchive({
            partitions: [
                { copy: library },
                { copy: library },
                { copy: library, name: "Library.json" },
                { copy: library, name: "renamed.json" }
            ],
            type: "uint8array"
        })
        deepEqual(await fileNames(saved), ["library.json", "library-2.json", "Library-3.json", "renamed.json"])
    })

    it("saves a LionWeb Archive equivalent to the one written by LionWeb Java", async () => {
        const saved = await saveArchive({
            layout: "lwa",
            languages: [{ name: "library-language.json", format: "json", chunk: libraryLanguage }],
            partitions: [{ name: "bobslibrary.json", format: "json", chunk: bobsLibrary }],
            type: "uint8array"
        })
        deepEqual(await fileNames(saved), ["metadata/metadata.properties", "languages/library.binpb", "partitions/bl.binpb"])
        equal(await (await JSZip.loadAsync(saved)).file("metadata/metadata.properties")!.async("text"), "LionWeb-Version=2023.1\n")

        const reloaded = await loadArchive(saved)
        const byJava = await loadArchive(readFileSync("test-fixtures/jvm/bobslibrary.lwa"))
        equal(reloaded.layout, "lwa")
        equal(reloaded.lionWebVersion, "2023.1")
        deepEqual(
            reloaded.partitions.map(({ name, format, chunk }) => ({ name, format, chunk })),
            byJava.partitions.map(({ name, format, chunk }) => ({ name, format, chunk }))
        )
        deepEqual(reloaded.partitions[0].chunk, withoutEmptyFeatures(bobsLibrary))
        deepEqual(
            reloaded.languages.map(({ name, chunk }) => ({ name, chunk })),
            byJava.languages.map(({ name, chunk }) => ({ name, chunk }))
        )
        deepEqual(reloaded.diagnostics, [])
    })

    it("stores the entries of a LionWeb Archive without compression by default, as LionWeb Java does", async () => {
        const saved = await saveArchive({
            layout: "lwa",
            partitions: [{ name: "x.json", format: "json", chunk: bobsLibrary }],
            type: "uint8array"
        })
        const file = (await JSZip.loadAsync(saved)).file("partitions/bl.binpb") as unknown as {
            _data: { compressedSize: number; uncompressedSize: number }
        }
        equal(file._data.compressedSize, file._data.uncompressedSize)
    })

    it("converts a LionWeb Archive to the snapshot layout and back", async () => {
        const byJava = await loadArchive(readFileSync("test-fixtures/jvm/bobslibrary.lwa"))
        const asSnapshot = await loadArchive(
            await saveArchive({
                languages: byJava.languages.map(copy => ({ copy })),
                partitions: byJava.partitions.map(copy => ({ copy })),
                type: "uint8array"
            })
        )
        equal(asSnapshot.layout, "snapshot")
        deepEqual(
            asSnapshot.partitions.map(partition => partition.name),
            ["languages/library.binpb", "partitions/bl.binpb"]
        )
        const backAsLwa = await loadArchive(
            await saveArchive({
                layout: "lwa",
                languages: [{ copy: asSnapshot.partitions[0] }],
                partitions: [{ copy: asSnapshot.partitions[1] }],
                type: "uint8array"
            })
        )
        deepEqual(
            backAsLwa.partitions.map(({ name, chunk }) => ({ name, chunk })),
            byJava.partitions.map(({ name, chunk }) => ({ name, chunk }))
        )
        deepEqual(
            backAsLwa.languages.map(({ name, chunk }) => ({ name, chunk })),
            byJava.languages.map(({ name, chunk }) => ({ name, chunk }))
        )
    })

    it("refuses a LionWeb Archive whose version cannot be determined", async () => {
        const chunk2024 = { ...bobsLibrary, serializationFormatVersion: "2024.1" }
        let message: string | undefined
        try {
            await saveArchive({
                layout: "lwa",
                partitions: [
                    { name: "a.json", format: "json", chunk: bobsLibrary },
                    { name: "b.json", format: "json", chunk: chunk2024 }
                ],
                type: "uint8array"
            })
        } catch (error) {
            message = (error as Error).message
        }
        equal(message, "Cannot store chunks of different serialization format versions (2023.1, 2024.1) in one LionWeb Archive")

        const empty = await loadArchive(await saveArchive({ layout: "lwa", partitions: [], lionWebVersion: "2024.1", type: "uint8array" }))
        equal(empty.lionWebVersion, "2024.1")
    })

    it("returns a Blob when asked, and reports progress", async () => {
        const percents: number[] = []
        const blob = await saveArchive({
            partitions: [{ name: "library.json", format: "json", chunk: bobsLibrary }],
            type: "blob",
            onProgress: percent => percents.push(percent)
        })
        assert.isTrue(blob instanceof Blob)
        equal((await loadArchive(blob)).partitions.length, 1)
        equal(percents[percents.length - 1], 100)
    })
})
