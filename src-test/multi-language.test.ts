import {assert} from "chai"
const {deepEqual} = assert

import {undefinedValuesDeletedFrom} from "./utils/test-helpers.js"
import {deserializeChunk, serializeNodes} from "../src-pkg/index.js"
import {multiLanguage} from "./m3/multi-language.js"
import {multiModel, multiModelApi} from "./multi.js"
import {libraryLanguage} from "./m3/library-language.js"


describe("multi-language test model", () => {

    it("[de-]serialize multi-language model", () => {
        const serialization = serializeNodes(multiModel, multiModelApi)
        const deserialization = deserializeChunk(undefinedValuesDeletedFrom(serialization), multiModelApi, [libraryLanguage, multiLanguage], [])
        deepEqual(deserialization, multiModel)
    })
})

