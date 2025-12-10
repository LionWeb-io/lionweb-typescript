import { deserializerWith, serializerWith } from "@lionweb/core"
import { libraryWriter } from "../instances/library.js"
import { multiModel, multiReader } from "../instances/multi.js"

import { libraryLanguage } from "../languages/library.js"
import { multiLanguage } from "../languages/multi.js"
import { deepEqual } from "../test-utils/assertions.js"


describe("multi-language test model", () => {
    it("[de-]serialize multi-language model", () => {
        const serializationChunk = serializerWith({ reader: multiReader })(multiModel)
        const deserialization = deserializerWith({
            writer: libraryWriter,
            languages: [libraryLanguage, multiLanguage]
        })(serializationChunk)
        deepEqual(deserialization, multiModel)
    })
})

