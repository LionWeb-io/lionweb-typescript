import {assert} from "chai"
const {deepEqual} = assert

import {deserializeChunk, serializeNodes} from "@lionweb/core"
import {libraryLanguage} from "./languages/library.js"
import {multiLanguage} from "./languages/multi.js"
import {libraryWriteModelAPI} from "./instances/library.js"
import {multiModel, multiReadModelAPI} from "./instances/multi.js"


describe("multi-language test model", () => {

    it("[de-]serialize multi-language model", () => {
        const serialization = serializeNodes(multiModel, multiReadModelAPI)
        const deserialization = deserializeChunk(serialization, libraryWriteModelAPI, [libraryLanguage, multiLanguage], [])
        deepEqual(deserialization, multiModel)
    })

})

