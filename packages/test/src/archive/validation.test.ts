import { assert } from "chai"

import { validateChunk } from "@lionweb/archive"
import { bobsLibrary } from "./helpers.js"

const { doesNotThrow, throws } = assert

/** @return a copy of the Bob's library chunk, to be changed freely. */
const bobsLibraryCopy = () => structuredClone(bobsLibrary)

describe("validation of chunks", () => {
    it("accepts a valid 2023.1 chunk", () => {
        doesNotThrow(() => validateChunk(bobsLibrary))
    })

    it("accepts a valid 2024.1 chunk", () => {
        doesNotThrow(() => validateChunk({ ...bobsLibrary, serializationFormatVersion: "2024.1" }))
    })

    it("rejects values that are not chunks", () => {
        throws(() => validateChunk(null), "Expected a LionWeb chunk")
        throws(() => validateChunk("chunk"), "Expected a LionWeb chunk")
        throws(() => validateChunk({ serializationFormatVersion: "2023.1" }), "missing nodes/languages")
    })

    it("rejects an unsupported serialization format version", () => {
        throws(
            () => validateChunk({ ...bobsLibrary, serializationFormatVersion: "2022.1" }),
            "Unsupported LionWeb serialization format version: 2022.1"
        )
    })

    it("rejects duplicate node IDs", () => {
        const chunk = bobsLibraryCopy()
        chunk.nodes.push(chunk.nodes[0])
        throws(() => validateChunk(chunk), "Duplicate node ID in chunk: bl")
    })

    it("rejects malformed nodes and features", () => {
        const withoutId = bobsLibraryCopy()
        delete (withoutId.nodes[0] as { id?: string }).id
        throws(() => validateChunk(withoutId), "Invalid LionWeb node")

        const badProperty = bobsLibraryCopy()
        ;(badProperty.nodes[0].properties[0] as { value: unknown }).value = 42
        throws(() => validateChunk(badProperty), "Invalid property on bl")

        const badChildren = bobsLibraryCopy()
        ;(badChildren.nodes[0].containments[0] as { children: unknown }).children = [1]
        throws(() => validateChunk(badChildren), "Invalid containment on bl")
    })
})
