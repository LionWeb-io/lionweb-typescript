import { serializerWith } from "@lionweb/core"
import { LionWebKey } from "@lionweb/json"
import { readFileAsJsonSync, writeJsonAsFileSync } from "@lionweb/node-utils"
import { asMinimalJsonString } from "@lionweb/ts-utils"
import {
    aggregateMetrics,
    ClassifierInstantiationMetric,
    ClassifierPointer,
    LanguageMetric,
    LanguagePointer,
    measure,
    mergeMetrics
} from "@lionweb/utilities"
import { join } from "path"

import { libraryModel, libraryReader } from "../instances/library.js"
import { multiModel, multiReader } from "../instances/multi.js"
import { libraryLanguage } from "../languages/library.js"
import { multiLanguage } from "../languages/multi.js"
import { deepEqual } from "../test-utils/assertions.js"


describe("metrics computation", () => {

    // remove undefineds because they don’t “survive” writing as a JSON file, so comparison would always fail:
    const withoutUndefineds = (json: unknown) => JSON.parse(asMinimalJsonString(json))

    const compareWithFile = (json: unknown, path: string) => {
        try {
            deepEqual(withoutUndefineds(json), readFileAsJsonSync(path))
        } catch (_) {
            writeJsonAsFileSync(path, json)
            console.error(`[NOTE] overwrote ${path} with actual contents — check correct, and commit if it is`)
        }
    }

    const path = "artifacts/utilities/metrics"

    it("works on library model", () => {
        const serializationChunk = serializerWith({ reader: libraryReader })(libraryModel)
        compareWithFile(measure(serializationChunk, []), join(path, "library-no-languages.metrics.json"))
        compareWithFile(measure(serializationChunk, [libraryLanguage]), join(path, "library-with-languages.metrics.json"))
    })

    it("works on multi-language model", () => {
        const serializationChunk = serializerWith({ reader: multiReader })(multiModel)
        compareWithFile(measure(serializationChunk, []), join(path, "multi-no-languages.metrics.json"))
        compareWithFile(measure(serializationChunk, [multiLanguage]), join(path, "multi-with-languages.metrics.json"))
    })

    it("aggregates over two models", () => {
        const leftMetrics = measure(serializerWith({ reader: libraryReader })(libraryModel), [libraryLanguage])
        const rightMetrics = measure(serializerWith({ reader: multiReader })(multiModel), [multiLanguage])
        const mergedMetrics = aggregateMetrics([leftMetrics, rightMetrics])
        compareWithFile(mergedMetrics, join(path, "merged-metrics.json"))
    })

})


describe("metrics merging", () => {

    // the one version string:
    const version = "0"

    const languageMetric = (key: LionWebKey, instantiations: number, name?: string): LanguageMetric => ({
        key,
        version,
        name,
        instantiations
    })

    const instantiationMetric = (languageKey: LionWebKey, classifierKey: LionWebKey, instantiations: number): ClassifierInstantiationMetric => ({
        language: {
            key: languageKey,
            version
        },
        key: classifierKey,
        name: undefined,
        metaType: "concept",
        instantiations
    })

    const languagePointer = (key: LionWebKey): LanguagePointer => ({
        key,
        version
    })

    const classifierPointer = (languageKey: LionWebKey, classifierKey: LionWebKey): ClassifierPointer => ({
        language: languagePointer(languageKey),
        key: classifierKey
    })

    it("works for languagesWithInstantiations + instantiatedClassifiers", () => {
        deepEqual(
            mergeMetrics(
                {
                    languagesWithInstantiations: [
                        languageMetric("lang-1", 1),
                        languageMetric("lang-2", 5, "bar")
                    ],
                    instantiatedClassifiers: [
                        instantiationMetric("lang-1", "concept-A", 1),
                        instantiationMetric("lang-2", "concept-B", 5),
                    ],
                    languagesWithoutInstantiations: [],
                    uninstantiatedInstantiableClassifiers: []
                },
                {
                    languagesWithInstantiations: [
                        languageMetric("lang-1", 2, "foo"),
                        languageMetric("lang-3", 10)
                    ],
                    instantiatedClassifiers: [
                        instantiationMetric("lang-3", "concept-C", 10),
                        instantiationMetric("lang-1", "concept-A", 2)
                    ],
                    languagesWithoutInstantiations: [],
                    uninstantiatedInstantiableClassifiers: []
                }
            ),
            {
                languagesWithInstantiations: [
                    languageMetric("lang-1", 3, "foo"), // (name taken from right)
                    languageMetric("lang-2", 5, "bar"),
                    languageMetric("lang-3", 10)
                ],
                instantiatedClassifiers: [
                    instantiationMetric("lang-1", "concept-A", 3),
                    instantiationMetric("lang-2", "concept-B", 5),
                    instantiationMetric("lang-3", "concept-C", 10)
                ],
                languagesWithoutInstantiations: [],
                uninstantiatedInstantiableClassifiers: []
            }
        )
    })

    it("works for languagesWithoutInstantiations + uninstantiatedInstantiableClassifiers", () => {
        deepEqual(
            mergeMetrics(
                {
                    languagesWithInstantiations: [
                        languageMetric("lang-1", 1)
                    ],
                    instantiatedClassifiers: [
                        instantiationMetric("lang-1", "concept-A", 1)
                    ],
                    languagesWithoutInstantiations: [
                        languagePointer("lang-2"),
                        languagePointer("lang-3")
                    ],
                    uninstantiatedInstantiableClassifiers: [
                        classifierPointer("lang-2", "concept-B"),
                        classifierPointer("lang-3", "concept-E")
                    ]
                },
                {
                    languagesWithInstantiations: [
                        languageMetric("lang-2", 2)
                    ],
                    instantiatedClassifiers: [
                        instantiationMetric("lang-2", "concept-B", 2)
                    ],
                    languagesWithoutInstantiations: [
                        languagePointer("lang-1"),
                        languagePointer("lang-3"),
                        languagePointer("lang-4")
                    ],
                    uninstantiatedInstantiableClassifiers: [
                        classifierPointer("lang-1", "concept-A"),
                        classifierPointer("lang-3", "concept-E"),
                        classifierPointer("lang-4", "concept-F")
                    ]
                }
            ),
            {
                languagesWithInstantiations: [
                    languageMetric("lang-1", 1),
                    languageMetric("lang-2", 2)
                ],
                instantiatedClassifiers: [
                    instantiationMetric("lang-1", "concept-A", 1),
                    instantiationMetric("lang-2", "concept-B", 2),
                ],
                languagesWithoutInstantiations: [
                    languagePointer("lang-3"),
                    languagePointer("lang-4")
                ],
                uninstantiatedInstantiableClassifiers: [
                    classifierPointer("lang-3", "concept-E"),
                    classifierPointer("lang-4", "concept-F")
                ]
            }
        )
    })

})

