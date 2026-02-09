import { serializerWith } from "@lionweb/core"
import { asMinimalJsonString } from "@lionweb/ts-utils"
import { measure, readFileAsJson, writeJsonAsFile } from "@lionweb/utilities"
import { join } from "path"

import { libraryModel, libraryReader } from "../instances/library.js"
import { multiModel, multiReader } from "../instances/multi.js"
import { libraryLanguage } from "../languages/library.js"
import { multiLanguage } from "../languages/multi.js"
import { deepEqual } from "../test-utils/assertions.js"


describe("metrics computation", () => {

    // remove undefineds because they don’t “survive” writing as a JSON file, so comparison would always fail:
    const removeUndefineds = (json: unknown) => JSON.parse(asMinimalJsonString(json))

    const compareWithFile = (json: unknown, path: string) => {
        try {
            deepEqual(removeUndefineds(json), readFileAsJson(path))
        } catch (_) {
            writeJsonAsFile(path, json)
            console.error(`[NOTE] overwrote ${path} with actual contents — check correct, and commit if it is`)
        }
    }

    it("works on library", () => {
        const path = "artifacts/test-languages/library"
        const serializationChunk = serializerWith({ reader: libraryReader })(libraryModel)
        compareWithFile(measure(serializationChunk, []), join(path, "library-no-languages.metrics.json"))
        compareWithFile(measure(serializationChunk, [libraryLanguage]), join(path, "library-with-languages.metrics.json"))
    })

    it("works on multi-language model", () => {
        const path = "artifacts/test-languages/multi"
        const serializationChunk = serializerWith({ reader: multiReader })(multiModel)
        compareWithFile(measure(serializationChunk, []), join(path, "multi-no-languages.metrics.json"))
        compareWithFile(measure(serializationChunk, [multiLanguage]), join(path, "multi-with-languages.metrics.json"))
    })

})

