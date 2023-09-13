import {assert} from "chai"
const {deepEqual} = assert

import {deserializeLanguage, lioncoreBuiltins, serializeLanguage} from "../../src-pkg/index.js"
import {libraryLanguage} from "./library-language.js"
import {undefinedValuesDeletedFrom} from "../utils/test-helpers.js"


describe("Library test metamodel", () => {

    it("LIonCore built-in primitive types are implicit", () => {
        libraryLanguage.dependingOn(lioncoreBuiltins)
        deepEqual(libraryLanguage.dependsOn, [])
    })

    it("serialize it", () => {
        const serialization = serializeLanguage(libraryLanguage)
        const deserialization = deserializeLanguage(undefinedValuesDeletedFrom(serialization))
        deepEqual(deserialization, libraryLanguage)
    })

})

