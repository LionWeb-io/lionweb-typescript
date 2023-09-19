import {assert} from "chai"
const {deepEqual} = assert

import {deserializeLanguage, lioncoreBuiltins, serializeLanguage} from "../../src-pkg/index.js"
import {libraryLanguage} from "../languages/library.js"


describe("Library test metamodel", () => {

    it("LionCore built-in primitive types are implicit", () => {
        libraryLanguage.dependingOn(lioncoreBuiltins)
        deepEqual(libraryLanguage.dependsOn, [])
    })

    it("serialize it", () => {
        const serialization = serializeLanguage(libraryLanguage)
        const deserialization = deserializeLanguage(serialization)
        deepEqual(deserialization, libraryLanguage)
    })

})

