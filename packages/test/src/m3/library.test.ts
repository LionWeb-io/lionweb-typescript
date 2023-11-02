import {assert} from "chai"
const {deepEqual} = assert

import {deserializeLanguages, lioncoreBuiltins, serializeLanguages} from "@lionweb/core"
import {libraryLanguage} from "../languages/library.js"


describe("Library test metamodel", () => {

    it("LionCore built-in primitive types are implicit", () => {
        libraryLanguage.dependingOn(lioncoreBuiltins)
        deepEqual(libraryLanguage.dependsOn, [])
    })

    it("serialize it", () => {
        const serialization = serializeLanguages(libraryLanguage)
        const deserialization = deserializeLanguages(serialization)
        deepEqual(deserialization.length, 1)
        deepEqual(deserialization[0], libraryLanguage)
    })

})

