import {assert} from "chai"
const {deepEqual} = assert

import {undefinedValuesDeletedFrom} from "./utils/test-helpers.js"
import {deserializeChunk, serializeNodes} from "../src-pkg/index.js"
import {multiLanguage} from "./languages/multi.js"
import {multiModel, multiModelApi} from "./instances/multi.js"
import {libraryLanguage} from "./languages/library.js"


describe("multi-language test model", () => {

    it("[de-]serialize multi-language model", () => {
        const serialization = serializeNodes(multiModel, multiModelApi)
        const deserialization = deserializeChunk(undefinedValuesDeletedFrom(serialization), multiModelApi, [libraryLanguage, multiLanguage], [])
        deepEqual(deserialization, multiModel)
    })
})

