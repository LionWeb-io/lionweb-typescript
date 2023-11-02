import {assert} from "chai"
const {deepEqual} = assert

import {deserializeLanguages, Enumeration, serializeLanguages} from "@lionweb/core"
import {languageWithEnum} from "./languages/with-enum.js"


describe("Language-with-enum test model", () => {

    it("roundtrip persistence of M2", () => {
        const serialization = serializeLanguages(languageWithEnum)
        const deserialization = deserializeLanguages(serialization)
        deepEqual(deserialization.length, 1)
        deepEqual(deserialization[0], languageWithEnum)
        const language = deserialization[0]
        const enum_ = language.entities[0]
        deepEqual(enum_ instanceof Enumeration, true)
        deepEqual((enum_ as Enumeration).literals.length, 2)
    })

})

