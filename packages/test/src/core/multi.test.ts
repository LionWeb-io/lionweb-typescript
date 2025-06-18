import { deserializeSerializationChunk, nodeSerializer } from "@lionweb/core"
import { libraryWriter } from "../instances/library.js"
import { multiModel, multiReader } from "../instances/multi.js"

import { libraryLanguage } from "../languages/library.js"
import { multiLanguage } from "../languages/multi.js"
import { deepEqual } from "../test-utils/assertions.js"

describe("multi-language test model", () => {
    it("[de-]serialize multi-language model", () => {
        const serializationChunk = nodeSerializer(multiReader)(multiModel)
        const deserialization = deserializeSerializationChunk(
            serializationChunk,
            libraryWriter,
            [libraryLanguage, multiLanguage],
            []
        )
        deepEqual(deserialization, multiModel)
    })
})
