import { deserializeLanguagesFrom, Enumeration, serializeLanguagesFor } from "@lionweb/core"

import { languageWithEnum } from "../languages/with-enum.js"
import { deepEqual } from "../test-utils/assertions.js"

describe("Language-with-enum test model", () => {
    it("roundtrip persistence of M2", () => {
        const serializationChunk = serializeLanguagesFor({ languages: [languageWithEnum] })
        const deserialization = deserializeLanguagesFrom({ serializationChunk })
        deepEqual(deserialization.length, 1)
        deepEqual(deserialization[0], languageWithEnum)
        const language = deserialization[0]
        const enum_ = language.entities[0]
        deepEqual(enum_ instanceof Enumeration, true)
        deepEqual((enum_ as Enumeration).literals.length, 2)
    })
})
