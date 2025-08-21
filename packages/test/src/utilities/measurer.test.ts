import { nodeSerializer } from "@lionweb/core"
import { measure, readFileAsJson, writeJsonAsFile } from "@lionweb/utilities"
import { join } from "path"

import { libraryModel, libraryReader } from "../instances/library.js"
import { multiModel, multiReader } from "../instances/multi.js"
import { libraryLanguage } from "../languages/library.js"
import { multiLanguage } from "../languages/multi.js"
import { deepEqual } from "../test-utils/assertions.js"

describe("metrics computation", () => {
    const removeUndefineds = (json: unknown) => JSON.parse(JSON.stringify(json))

    const compareWithFile = (json: unknown, fileName: string) => {
        const path = join("metrics", fileName)
        try {
            deepEqual(removeUndefineds(json), readFileAsJson(path))
        } catch (_) {
            console.error(`overwrote ${path} with actual contents`)
            writeJsonAsFile(path, json)
        }
    }

    it("works on library", () => {
        const serializationChunk = nodeSerializer(libraryReader)(libraryModel)
        compareWithFile(measure(serializationChunk, []), "library-no-languages.metrics.json")
        compareWithFile(measure(serializationChunk, [libraryLanguage]), "library-with-languages.metrics.json")
    })

    it("works on multi-language model", () => {
        const serializationChunk = nodeSerializer(multiReader)(multiModel)
        compareWithFile(measure(serializationChunk, []), "multi-no-languages.metrics.json")
        compareWithFile(measure(serializationChunk, [multiLanguage]), "multi-with-languages.metrics.json")
    })
})
