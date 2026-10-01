import { LionWebJsonChunk } from "@lionweb/json"
import { assert } from "chai"
import { readFileSync } from "fs"
import JSZip from "jszip"

import { decodeChunk, encodeChunk, loadSnapshot, LoadProgress } from "../index.js"

const { deepEqual, equal } = assert

const readJson = (path: string): LionWebJsonChunk => JSON.parse(readFileSync(path).toString())
const bobsLibrary = readJson("test-fixtures/bobslibrary.json")
const libraryLanguage = readJson("test-fixtures/library-language.json")

const zipOf = async (files: Record<string, string | Uint8Array>): Promise<Uint8Array> => {
    const zip = new JSZip()
    Object.entries(files).forEach(([path, content]) => zip.file(path, content))
    return zip.generateAsync({ type: "uint8array" })
}

describe("loading of snapshots", () => {
    it("loads a LionWeb Archive written by LionWeb Java", async () => {
        const snapshot = await loadSnapshot(readFileSync("test-fixtures/jvm/bobslibrary.lwa"))
        equal(snapshot.layout, "lwa")
        equal(snapshot.lionWebVersion, "2023.1")
        deepEqual(
            snapshot.languages.map(({ name, format }) => ({ name, format })),
            [{ name: "languages/library.binpb", format: "binpb" }]
        )
        deepEqual(
            snapshot.entries.map(({ name, format }) => ({ name, format })),
            [{ name: "partitions/bl.binpb", format: "binpb" }]
        )
        deepEqual(snapshot.entries[0].chunk, decodeChunk(new Uint8Array(readFileSync("test-fixtures/jvm/bobslibrary.binpb"))))
        equal(snapshot.languages[0].chunk.nodes[0].id, libraryLanguage.nodes[0].id)
        deepEqual(snapshot.otherFiles, [])
        deepEqual(snapshot.diagnostics, [])
    })

    it("loads a snapshot of JSON and protobuf chunks, keeping track of the other files", async () => {
        const data = await zipOf({
            "library.json": JSON.stringify(bobsLibrary),
            "nested/language.binpb": encodeChunk(libraryLanguage),
            "README.md": "# A snapshot"
        })
        const snapshot = await loadSnapshot(data)
        equal(snapshot.layout, "snapshot")
        assert.isUndefined(snapshot.lionWebVersion)
        deepEqual(snapshot.languages, [])
        deepEqual(snapshot.entries, [
            { name: "library.json", format: "json", chunk: bobsLibrary },
            { name: "nested/language.binpb", format: "binpb", chunk: libraryLanguage }
        ])
        deepEqual(snapshot.otherFiles, ["README.md"])
        deepEqual(snapshot.diagnostics, [])
    })

    it("accepts an ArrayBuffer, a Uint8Array and a Blob", async () => {
        const data = await zipOf({ "library.json": JSON.stringify(bobsLibrary) })
        const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer
        for (const input of [data, arrayBuffer, new Blob([arrayBuffer])]) {
            equal((await loadSnapshot(input)).entries.length, 1)
        }
    })

    it("reports entries that cannot be read, and loads the others", async () => {
        const data = await zipOf({
            "broken.json": "{ not JSON",
            "broken.binpb": new Uint8Array([0xff, 0xff, 0xff]),
            "invalid.json": JSON.stringify({ ...bobsLibrary, serializationFormatVersion: "2022.1" }),
            "library.json": JSON.stringify(bobsLibrary)
        })
        const snapshot = await loadSnapshot(data)
        deepEqual(
            snapshot.entries.map(entry => entry.name),
            ["library.json"]
        )
        deepEqual(
            snapshot.diagnostics.map(({ severity, entry }) => ({ severity, entry })),
            [
                { severity: "error", entry: "broken.json" },
                { severity: "error", entry: "broken.binpb" },
                { severity: "error", entry: "invalid.json" }
            ]
        )
        equal(snapshot.diagnostics[2].message, "Unsupported LionWeb serialization format version: 2022.1")
    })

    it("skips validation when asked", async () => {
        const data = await zipOf({ "invalid.json": JSON.stringify({ ...bobsLibrary, serializationFormatVersion: "2022.1" }) })
        const snapshot = await loadSnapshot(data, { validate: false })
        equal(snapshot.entries.length, 1)
        deepEqual(snapshot.diagnostics, [])
    })

    it("reports progress", async () => {
        const data = await zipOf({ "a.json": JSON.stringify(bobsLibrary), "b.json": JSON.stringify(bobsLibrary), "c.txt": "" })
        const progress: LoadProgress[] = []
        await loadSnapshot(data, { onProgress: p => progress.push(p) })
        deepEqual(progress, [
            { processed: 0, total: 2 },
            { processed: 1, total: 2, currentEntry: "a.json" },
            { processed: 2, total: 2, currentEntry: "b.json" }
        ])
    })

    it("reads a LionWeb Archive according to its layout", async () => {
        const data = await zipOf({
            "METADATA/Metadata.properties": "#a comment\nLionWeb-Version=2023.1\n",
            "languages/library.binpb": encodeChunk(libraryLanguage),
            "partitions/bl.binpb": encodeChunk(bobsLibrary),
            "elsewhere.binpb": encodeChunk(bobsLibrary)
        })
        const snapshot = await loadSnapshot(data)
        equal(snapshot.layout, "lwa")
        equal(snapshot.lionWebVersion, "2023.1")
        deepEqual(
            snapshot.languages.map(entry => entry.name),
            ["languages/library.binpb"]
        )
        deepEqual(
            snapshot.entries.map(entry => entry.name),
            ["partitions/bl.binpb"]
        )
        deepEqual(snapshot.otherFiles, ["elsewhere.binpb"])
        deepEqual(snapshot.diagnostics, [])
    })

    it("warns about a LionWeb Archive without version, or with chunks of another version", async () => {
        const withoutVersion = await loadSnapshot(
            await zipOf({ "metadata/metadata.properties": "", "partitions/bl.binpb": encodeChunk(bobsLibrary) })
        )
        assert.isUndefined(withoutVersion.lionWebVersion)
        deepEqual(withoutVersion.diagnostics, [
            { severity: "warning", entry: "metadata/metadata.properties", message: "No LionWeb-Version property in the archive metadata" }
        ])

        const otherVersion = await loadSnapshot(
            await zipOf({ "metadata/metadata.properties": "LionWeb-Version=2024.1", "partitions/bl.binpb": encodeChunk(bobsLibrary) })
        )
        equal(otherVersion.entries.length, 1)
        deepEqual(otherVersion.diagnostics, [
            {
                severity: "warning",
                entry: "partitions/bl.binpb",
                message: "Serialization format version 2023.1 differs from the archive's LionWeb-Version 2024.1"
            }
        ])
    })
})
