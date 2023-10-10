import {assert} from "chai"
const {deepEqual} = assert

import {deserializeChunk, serializeNodes} from "@lionweb/core"
import {libraryLanguage} from "./languages/library.js"
import {multiLanguage} from "./languages/multi.js"
import {libraryInstantiationFacade} from "./instances/library.js"
import {multiModel, multiExtractionFacade} from "./instances/multi.js"


describe("multi-language test model", () => {

    it("[de-]serialize multi-language model", () => {
        const serialization = serializeNodes(multiModel, multiExtractionFacade)
        const deserialization = deserializeChunk(serialization, libraryInstantiationFacade, [libraryLanguage, multiLanguage], [])
        deepEqual(deserialization, multiModel)
    })

})

