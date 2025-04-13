import { serializeNodes } from "@lionweb/core"
import { measure, readFileAsJson, writeJsonAsFile } from "@lionweb/utilities"
import { join } from "path"

import { libraryExtractionFacade, libraryModel } from "./instances/library.js"
import { multiExtractionFacade, multiModel } from "./instances/multi.js"
import { libraryLanguage } from "./languages/library.js"
import { multiLanguage } from "./languages/multi.js"
import { deepEqual } from "./utils/assertions.js"

describe("metrics computation", () => {
    const removeUndefineds = (json: unknown) => JSON.parse(JSON.stringify(json))

    const compareWithFile = (json: unknown, fileName: string) => {
        const path = join("metrics", fileName)
        try {
            deepEqual(removeUndefineds(json), readFileAsJson(path))
        } catch (e) {
            console.error(`overwrote ${path} with actual contents`)
            writeJsonAsFile(path, json)
        }
    }

    it("works on library", () => {
        const serializationChunk = serializeNodes(libraryModel, libraryExtractionFacade)
        compareWithFile(measure(serializationChunk, []), "library-no-languages.metrics.json")
        compareWithFile(measure(serializationChunk, [libraryLanguage]), "library-with-languages.metrics.json")
    })

    it("works on multi-language model", () => {
        const serializationChunk = serializeNodes(multiModel, multiExtractionFacade)
        compareWithFile(measure(serializationChunk, []), "multi-no-languages.metrics.json")
        compareWithFile(measure(serializationChunk, [multiLanguage]), "multi-with-languages.metrics.json")
    })
})
