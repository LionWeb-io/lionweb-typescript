import { deserializeSerializationChunk, nodeSerializer } from "@lionweb/core"
import { libraryInstantiationFacade } from "../instances/library.js"
import { multiModel, multiReader } from "../instances/multi.js"

import { libraryLanguage } from "../languages/library.js"
import { multiLanguage } from "../languages/multi.js"
import { deepEqual } from "../test-utils/assertions.js"

describe("multi-language test model", () => {
    it("[de-]serialize multi-language model", () => {
        const serializationChunk = nodeSerializer(multiReader)(multiModel)
        const deserialization = deserializeSerializationChunk(
            serializationChunk,
            libraryInstantiationFacade,
            [libraryLanguage, multiLanguage],
            []
        )
        deepEqual(deserialization, multiModel)
    })
})
