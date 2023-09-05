import {assert} from "chai"
const {deepEqual} = assert

import {undefinedValuesDeletedFrom} from "./utils/test-helpers.js"
import {deserializeChunk, serializeNodes} from "../src-pkg/index.js"
import {libraryLanguage} from "./languages/library.js"
import {multiLanguage} from "./languages/multi.js"
import {libraryWriteModelAPI} from "./instances/library.js"
import {multiModel, multiReadModelAPI} from "./instances/multi.js"


describe("multi-language test model", () => {

    it("[de-]serialize multi-language model", () => {
        const serialization = serializeNodes(multiModel, multiReadModelAPI)
        const deserialization = deserializeChunk(undefinedValuesDeletedFrom(serialization), libraryWriteModelAPI, [libraryLanguage, multiLanguage], [])
        deepEqual(deserialization, multiModel)
    })

})

