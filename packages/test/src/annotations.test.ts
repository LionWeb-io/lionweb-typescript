import { AccumulatingSimplisticHandler, deserializeLanguagesWithHandler, lioncore } from "@lionweb/core"
import { currentSerializationFormatVersion, LionWebJsonChunk } from "@lionweb/json"
import { genericAsTreeText, languageAsText, readFileAsJson, withoutAnnotations } from "@lionweb/utilities"
import { readFileSync } from "fs"

import { deepEqual, equal } from "./utils/assertions.js"

describe("annotation remover", () => {
    it("removes annotation instances and references to it", () => {
        /*
        const annoLanguage = new Language("annoLanguage", "0", "annoLanguage", "annoLanguage")
        const aConcept = new Concept(annoLanguage, "aConcept", "aConcept", "aConcept", false)
        const aConcept_subConcepts = new Containment(aConcept, "subConcepts", "aConcept-subConcepts", "aConcept-subConcepts")
            .ofType(aConcept).isOptional()
        aConcept.havingFeatures(aConcept_subConcepts)
        const anAnnotation = new Annotation(annoLanguage, "anAnno", "anAnno", "anAnno").annotating(aConcept)
        annoLanguage.havingEntities(aConcept, anAnnotation)
         */

        const languagePartialMetaPointer = {
            language: "annoLanguage",
            version: "0"
        }
        const aConceptMetaPointer = {
            ...languagePartialMetaPointer,
            key: "aConcept"
        }

        const serializationChunk: LionWebJsonChunk = {
            serializationFormatVersion: currentSerializationFormatVersion,
            languages: [
                {
                    key: "annoLanguage",
                    version: "0"
                }
            ],
            nodes: [
                {
                    id: "aConcept-instance-grandchild",
                    classifier: aConceptMetaPointer,
                    properties: [],
                    containments: [],
                    references: [],
                    annotations: [],
                    parent: "anAnnotation-instance-child"
                },
                {
                    id: "aConcept-instance-child",
                    classifier: aConceptMetaPointer,
                    properties: [],
                    containments: [
                        {
                            containment: {
                                ...languagePartialMetaPointer,
                                key: "aConcept-subConcepts"
                            },
                            children: ["aConcept-instance-grandchild", "another-child-not-in-this-chunk"]
                        }
                    ],
                    references: [],
                    annotations: [],
                    parent: "anAnnotation-instance"
                },
                {
                    id: "anAnnotation-instance",
                    classifier: {
                        ...languagePartialMetaPointer,
                        key: "anAnno"
                    },
                    properties: [],
                    containments: [
                        {
                            containment: {
                                ...languagePartialMetaPointer,
                                key: "aConcept-subConcepts"
                            },
                            children: ["aConcept-instance-child", "a-child-not-in-this-chunk"]
                        }
                    ],
                    references: [],
                    annotations: [],
                    parent: "aConcept-instance"
                },
                {
                    id: "aConcept-instance",
                    classifier: aConceptMetaPointer,
                    properties: [],
                    containments: [],
                    references: [],
                    annotations: ["anAnnotation-instance"],
                    parent: null
                }
            ]
        }

        deepEqual(withoutAnnotations(serializationChunk), {
            serializationFormatVersion: currentSerializationFormatVersion,
            languages: [
                {
                    key: "annoLanguage",
                    version: "0"
                }
            ],
            nodes: [
                {
                    id: "aConcept-instance",
                    classifier: aConceptMetaPointer,
                    properties: [],
                    containments: [],
                    references: [],
                    annotations: [],
                    parent: null
                }
            ]
        } as LionWebJsonChunk)
    })
})

describe("deserializing a meta-circular language", () => {
    it("works but reports problems", () => {
        const serializationChunk = readFileAsJson("src/languages/io.lionweb.mps.specific.json") as LionWebJsonChunk
        equal(
            genericAsTreeText(serializationChunk, [lioncore]),
            readFileSync("src/languages/io.lionweb.mps.specific.generic.txt", { encoding: "utf8" })
        )

        const gatherer = new AccumulatingSimplisticHandler()
        const languages = deserializeLanguagesWithHandler(serializationChunk, gatherer, lioncore)
        deepEqual(gatherer.allProblems, [
            "can't deserialize node with id=ShortDescription-ConceptDescription: can't find the classifier with key ConceptDescription in language (io-lionweb-mps-specific, 0)",
            "can't deserialize node with id=VirtualPackage-ConceptDescription: can't find the classifier with key ConceptDescription in language (io-lionweb-mps-specific, 0)"
            // The deserializer is not aware that this language contains instances of annotations defined in the language itself.
        ])
        equal(languages.length, 1)
        equal(languageAsText(languages[0]), readFileSync("src/languages/io.lionweb.mps.specific.m2.txt", { encoding: "utf8" }))
    })

    it("works without reporting problems after removing annotations", () => {
        const serializationChunk = readFileAsJson("src/languages/io.lionweb.mps.specific.json") as LionWebJsonChunk
        const preGatherer = new AccumulatingSimplisticHandler()
        const preAnnotationLanguage = deserializeLanguagesWithHandler(withoutAnnotations(serializationChunk), preGatherer, lioncore)[0]
        deepEqual(preGatherer.allProblems, [])

        const postGatherer = new AccumulatingSimplisticHandler()
        // (just run, don't check what comes out:)
        deserializeLanguagesWithHandler(serializationChunk, postGatherer, lioncore, preAnnotationLanguage)
        deepEqual(postGatherer.allProblems, [
            "error occurred during instantiation of a node for classifier ConceptDescription with meta-pointer (io-lionweb-mps-specific, 0, ConceptDescription); reason:",
            "Error: don't know a node of concept io.lionweb.mps.specific.ConceptDescription with key ConceptDescription that's not in LionCore M3",
            "error occurred during instantiation of a node for classifier ConceptDescription with meta-pointer (io-lionweb-mps-specific, 0, ConceptDescription); reason:",
            "Error: don't know a node of concept io.lionweb.mps.specific.ConceptDescription with key ConceptDescription that's not in LionCore M3"
            // The deserializer is now aware of the existence of annotations (and knows its language), but can't instantiate instances of those,
            // because the lioncoreInstantiationFacade doesn't provide a runtime representation.
        ])
    })
})
