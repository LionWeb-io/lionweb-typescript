import { assert } from "chai"

import { decodeChunk, encodeChunk, loadArchive, LoadProgress } from "../index.js"
import { bobsLibrary, libraryLanguage, readBytes, zipOf } from "./test-utils.js"

const { deepEqual, equal } = assert

describe("loading of archives", () => {
    it("loads a LionWeb Archive written by LionWeb Java", async () => {
        const archive = await loadArchive(readBytes("test-fixtures/jvm/bobslibrary.lwa"))
        equal(archive.layout, "lwa")
        equal(archive.lionWebVersion, "2023.1")
        deepEqual(
            archive.languages.map(({ name, format }) => ({ name, format })),
            [{ name: "languages/library.binpb", format: "binpb" }]
        )
        deepEqual(
            archive.partitions.map(({ name, format }) => ({ name, format })),
            [{ name: "partitions/bl.binpb", format: "binpb" }]
        )
        deepEqual(archive.partitions[0].chunk, decodeChunk(readBytes("test-fixtures/jvm/bobslibrary.binpb")))
        equal(archive.languages[0].chunk.nodes[0].id, libraryLanguage.nodes[0].id)
        deepEqual(archive.otherFiles, [])
        deepEqual(archive.diagnostics, [])
    })

    it("loads an archive in the snapshot layout, with JSON and protobuf chunks and other files", async () => {
        const data = await zipOf({
            "library.json": JSON.stringify(bobsLibrary),
            "nested/language.binpb": encodeChunk(libraryLanguage),
            "README.md": "# An archive"
        })
        const archive = await loadArchive(data)
        equal(archive.layout, "snapshot")
        assert.isUndefined(archive.lionWebVersion)
        deepEqual(archive.languages, [])
        deepEqual(archive.partitions, [
            { name: "library.json", format: "json", chunk: bobsLibrary },
            { name: "nested/language.binpb", format: "binpb", chunk: libraryLanguage }
        ])
        deepEqual(archive.otherFiles, ["README.md"])
        deepEqual(archive.diagnostics, [])
    })

    it("accepts an ArrayBuffer, a Uint8Array and a Blob", async () => {
        const data = await zipOf({ "library.json": JSON.stringify(bobsLibrary) })
        const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer
        for (const input of [data, arrayBuffer, new Blob([arrayBuffer])]) {
            equal((await loadArchive(input)).partitions.length, 1)
        }
    })

    it("reports entries that cannot be read, and loads the others", async () => {
        const data = await zipOf({
            "broken.json": "{ not JSON",
            "broken.binpb": new Uint8Array([0xff, 0xff, 0xff]),
            "invalid.json": JSON.stringify({ ...bobsLibrary, serializationFormatVersion: "2022.1" }),
            "library.json": JSON.stringify(bobsLibrary)
        })
        const archive = await loadArchive(data)
        deepEqual(
            archive.partitions.map(entry => entry.name),
            ["library.json"]
        )
        deepEqual(
            archive.diagnostics.map(({ severity, entry }) => ({ severity, entry })),
            [
                { severity: "error", entry: "broken.json" },
                { severity: "error", entry: "broken.binpb" },
                { severity: "error", entry: "invalid.json" }
            ]
        )
        equal(archive.diagnostics[2].message, "Unsupported LionWeb serialization format version: 2022.1")
    })

    it("skips validation when asked", async () => {
        const data = await zipOf({ "invalid.json": JSON.stringify({ ...bobsLibrary, serializationFormatVersion: "2022.1" }) })
        const archive = await loadArchive(data, { validate: false })
        equal(archive.partitions.length, 1)
        deepEqual(archive.diagnostics, [])
    })

    it("reports progress", async () => {
        const data = await zipOf({ "a.json": JSON.stringify(bobsLibrary), "b.json": JSON.stringify(bobsLibrary), "c.txt": "" })
        const progress: LoadProgress[] = []
        await loadArchive(data, { onProgress: p => progress.push(p) })
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
        const archive = await loadArchive(data)
        equal(archive.layout, "lwa")
        equal(archive.lionWebVersion, "2023.1")
        deepEqual(
            archive.languages.map(entry => entry.name),
            ["languages/library.binpb"]
        )
        deepEqual(
            archive.partitions.map(entry => entry.name),
            ["partitions/bl.binpb"]
        )
        deepEqual(archive.otherFiles, ["elsewhere.binpb"])
        deepEqual(archive.diagnostics, [])
    })

    it("warns about a LionWeb Archive without version, or with chunks of another version", async () => {
        const withoutVersion = await loadArchive(
            await zipOf({ "metadata/metadata.properties": "", "partitions/bl.binpb": encodeChunk(bobsLibrary) })
        )
        assert.isUndefined(withoutVersion.lionWebVersion)
        deepEqual(withoutVersion.diagnostics, [
            { severity: "warning", entry: "metadata/metadata.properties", message: "No LionWeb-Version property in the archive metadata" }
        ])

        const otherVersion = await loadArchive(
            await zipOf({ "metadata/metadata.properties": "LionWeb-Version=2024.1", "partitions/bl.binpb": encodeChunk(bobsLibrary) })
        )
        equal(otherVersion.partitions.length, 1)
        deepEqual(otherVersion.diagnostics, [
            {
                severity: "warning",
                entry: "partitions/bl.binpb",
                message: "Serialization format version 2023.1 differs from the archive's LionWeb-Version 2024.1"
            }
        ])
    })
})
