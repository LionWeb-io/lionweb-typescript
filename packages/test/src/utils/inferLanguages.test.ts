import { deepEqual } from "assert"
import { LanguageEntity, serializeLanguages, serializeNodes } from "@lionweb/core"
import { inferLanguagesFromChunk, deriveLikelyPropertyName } from "@lionweb/utilities"

import { libraryExtractionFacade, libraryModel } from "../instances/library.js"
import { minimalLibraryLanguage } from "../languages/minimal-library.js"
import { multiExtractionFacade, multiModel } from "../instances/multi.js"
import { multiLanguage } from "../languages/multi.js"

describe("inferLanguagesFromChunk", () => {
    it("should correctly infer the minimal library language from the instance", () => {
        const serializationChunk = serializeNodes(libraryModel, libraryExtractionFacade)

        const languages = inferLanguagesFromChunk(serializationChunk)
        deepEqual(languages.length, 1)
        const inferredLanguage = languages[0]

        // Sort language entities to be able to compare them
        inferredLanguage.entities.sort(compare)
        minimalLibraryLanguage.entities.sort(compare)

        deepEqual(serializeLanguages(inferredLanguage), serializeLanguages(minimalLibraryLanguage))
    })

    it("should correctly infer the multi language from the instance", () => {
        const serializationChunk = serializeNodes(multiModel, multiExtractionFacade)

        const languages = inferLanguagesFromChunk(serializationChunk)
        deepEqual(languages.length, 2)
        const inferredMultiLanguage = languages[0]
        const inferredLibraryLanguage = languages[1]

        // We can't infer the language dependency
        inferredMultiLanguage.dependingOn(inferredLibraryLanguage)

        // Sort language entities to be able to compare them
        inferredLibraryLanguage.entities.sort(compare)
        minimalLibraryLanguage.entities.sort(compare)

        deepEqual(serializeLanguages(inferredLibraryLanguage), serializeLanguages(minimalLibraryLanguage))
        deepEqual(serializeLanguages(inferredMultiLanguage), serializeLanguages(multiLanguage))
    })
})

describe("deriveLikelyPropertyName", () => {
    describe("for supported formats", () => {
        ["-", "_"].forEach(separator => {
            const propertyKey = ["languageKey", "classifierKey", "propertyKey"].join(separator)
            it(`should derive the property name when using separator '${separator}'`, () => {
                const result = deriveLikelyPropertyName(propertyKey)
                deepEqual(result, "propertyKey")
            })
        })
    })

    describe("for unsupported formats", () => {
        const propertyKey = "classifierKey$propertyKey"
        it("should return the entire key", () => {
            const result = deriveLikelyPropertyName(propertyKey)
            deepEqual(result, propertyKey)
        })
    })
})

function compare(a: LanguageEntity, b: LanguageEntity) {
    if (a.id < b.id) {
        return -1
    }
    if (a.id > b.id) {
        return 1
    }
    return 0
}
