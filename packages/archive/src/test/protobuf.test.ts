import { LionWebJsonChunk } from "@lionweb/json"
import { assert } from "chai"
import { readFileSync } from "fs"

import { convertJsonChunkToPBChunk, decodeChunk, encodeChunk } from "../index.js"

const { deepEqual, equal } = assert

const readJson = (path: string): LionWebJsonChunk => JSON.parse(readFileSync(path).toString())
const readBytes = (path: string): Uint8Array => new Uint8Array(readFileSync(path))

/** What remains of a chunk once empty features are omitted, as LionWeb Java does in its archives. */
const withoutEmptyFeatures = (chunk: LionWebJsonChunk): LionWebJsonChunk => ({
    ...chunk,
    nodes: chunk.nodes.map(node => ({
        ...node,
        properties: node.properties.filter(property => property.value !== null),
        containments: node.containments.filter(containment => containment.children.length > 0),
        references: node.references.filter(reference => reference.targets.length > 0)
    }))
})

/** A chunk exercising nulls, multiple languages, annotations and references without target or resolve info. */
const chunk2024: LionWebJsonChunk = {
    serializationFormatVersion: "2024.1",
    languages: [
        { key: "lang-a", version: "1" },
        { key: "lang-b", version: "2" }
    ],
    nodes: [
        {
            id: "root",
            classifier: { language: "lang-a", version: "1", key: "Root" },
            properties: [
                { property: { language: "lang-a", version: "1", key: "name" }, value: "the root" },
                { property: { language: "lang-a", version: "1", key: "description" }, value: null },
                { property: { language: "lang-a", version: "1", key: "empty" }, value: "" }
            ],
            containments: [
                { containment: { language: "lang-a", version: "1", key: "children" }, children: ["child-1", "child-2"] },
                { containment: { language: "lang-a", version: "1", key: "none" }, children: [] }
            ],
            references: [],
            annotations: ["note"],
            parent: null
        },
        {
            id: "child-1",
            classifier: { language: "lang-a", version: "1", key: "Child" },
            properties: [],
            containments: [],
            references: [
                {
                    reference: { language: "lang-a", version: "1", key: "target" },
                    targets: [
                        { reference: "child-2", resolveInfo: "second" },
                        { reference: "child-2", resolveInfo: null },
                        { reference: null, resolveInfo: "unresolved" }
                    ]
                }
            ],
            annotations: [],
            parent: "root"
        },
        {
            id: "child-2",
            classifier: { language: "lang-a", version: "1", key: "Child" },
            properties: [],
            containments: [],
            references: [],
            annotations: [],
            parent: "root"
        },
        {
            id: "note",
            classifier: { language: "lang-b", version: "2", key: "Note" },
            properties: [{ property: { language: "lang-b", version: "2", key: "text" }, value: "remember: ünïcödé ✓" }],
            containments: [],
            references: [],
            annotations: [],
            parent: "root"
        }
    ]
}

describe("protobuf encoding of chunks", () => {
    it("decodes a chunk encoded by LionWeb Java", () => {
        const decoded = decodeChunk(readBytes("test-fixtures/jvm/bobslibrary.binpb"))
        deepEqual(decoded, withoutEmptyFeatures(readJson("test-fixtures/bobslibrary.json")))
    })

    it("round-trips an instance chunk", () => {
        const chunk = readJson("test-fixtures/bobslibrary.json")
        deepEqual(decodeChunk(encodeChunk(chunk)), chunk)
    })

    it("round-trips a language chunk", () => {
        const chunk = readJson("test-fixtures/library-language.json")
        deepEqual(decodeChunk(encodeChunk(chunk)), chunk)
    })

    it("round-trips a 2024.1 chunk with nulls, annotations and unresolved references", () => {
        deepEqual(decodeChunk(encodeChunk(chunk2024)), chunk2024)
    })

    it("round-trips an empty chunk", () => {
        const chunk: LionWebJsonChunk = { serializationFormatVersion: "2023.1", languages: [], nodes: [] }
        deepEqual(decodeChunk(encodeChunk(chunk)), chunk)
    })

    it("omits empty features when asked, as LionWeb Java does", () => {
        const chunk = readJson("test-fixtures/bobslibrary.json")
        const jvmDecoded = decodeChunk(readBytes("test-fixtures/jvm/bobslibrary.binpb"))
        deepEqual(decodeChunk(encodeChunk(chunk, { omitEmptyFeatures: true })), jvmDecoded)
        deepEqual(decodeChunk(encodeChunk(chunk2024, { omitEmptyFeatures: true })), withoutEmptyFeatures(chunk2024))
    })

    it("keeps empty features by default", () => {
        const pbChunk = convertJsonChunkToPBChunk(chunk2024)
        equal(pbChunk.nodes[0].properties.length, 3)
        equal(pbChunk.nodes[0].containments.length, 2)
        equal(convertJsonChunkToPBChunk(chunk2024, { omitEmptyFeatures: true }).nodes[0].properties.length, 2)
        equal(convertJsonChunkToPBChunk(chunk2024, { omitEmptyFeatures: true }).nodes[0].containments.length, 1)
    })

    it("interns each string, language and meta-pointer once", () => {
        const pbChunk = convertJsonChunkToPBChunk(chunk2024)
        equal(new Set(pbChunk.internedStrings).size, pbChunk.internedStrings.length)
        equal(pbChunk.internedLanguages.length, 2)
        // Root, name, description, empty, children, none, Child, target, Note, text
        equal(pbChunk.internedMetaPointers.length, 10)
    })
})
