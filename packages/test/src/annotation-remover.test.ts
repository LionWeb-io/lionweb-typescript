import {assert} from "chai"
const {deepEqual} = assert

import {Annotation, Concept, currentSerializationFormatVersion, Language, SerializationChunk} from "@lionweb/core"
import {withoutAnnotations} from "@lionweb/utilities"


describe("annotation remover", () => {

    it("removes annotation instances and references to it", () => {
        const annoLanguage = new Language("annoLanguage", "0", "annoLanguage", "annoLanguage")
        const aConcept = new Concept(annoLanguage, "aConcept", "aConcept", "aConcept", false)
        const anAnnotation = new Annotation(annoLanguage, "anAnno", "anAnno", "anAnno").annotating(aConcept)
        annoLanguage.havingEntities(aConcept, anAnnotation)

        const serializationChunk: SerializationChunk = {
            serializationFormatVersion: currentSerializationFormatVersion,
            languages: [
                {
                    "key": "annoLanguage",
                    "version": "0"
                }
            ],
            nodes: [
                {
                    id: "anAnnotation-instance",
                    classifier: {
                        language: "annoLanguage",
                        version: "0",
                        key: "anAnno"
                    },
                    properties: [],
                    containments: [],
                    references: [],
                    annotations: [],
                    parent: null
                },
                {
                    id: "aConcept-instance",
                    classifier: {
                        language: "annoLanguage",
                        version: "0",
                        key: "aConcept"
                    },
                    properties: [],
                    containments: [],
                    references: [],
                    annotations: [
                        "anAnnotation-instance"
                    ],
                    parent: null
                }
            ]
        }

        deepEqual(
            withoutAnnotations(serializationChunk),
            {
                serializationFormatVersion: currentSerializationFormatVersion,
                languages: [
                    {
                        "key": "annoLanguage",
                        "version": "0"
                    }
                ],
                nodes: [
                    {
                        id: "aConcept-instance",
                        classifier: {
                            language: "annoLanguage",
                            version: "0",
                            key: "aConcept"
                        },
                        properties: [],
                        containments: [],
                        references: [],
                        annotations: [],
                        parent: null
                    }
                ]
            } as SerializationChunk
        )
    })

})

