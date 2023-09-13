import {assert} from "chai"
const {deepEqual} = assert

import {deserializeLanguage, Enumeration, serializeLanguage} from "../src-pkg/index.js"
import {languageWithEnum} from "./m3/language-with-enum.js"


describe("Language-with-enum test model", () => {

    it("roundtrip persistence of M2", () => {
        const serialization = serializeLanguage(languageWithEnum)
        const deserialization = deserializeLanguage(serialization)
        deepEqual(deserialization, languageWithEnum)
        const enum_ = deserialization.entities[0]
        deepEqual(enum_ instanceof Enumeration, true)
        deepEqual((enum_ as Enumeration).literals.length, 2)
    })

})

