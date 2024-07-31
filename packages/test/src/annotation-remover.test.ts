import {assert} from "chai"
const {deepEqual} = assert

import {
    currentSerializationFormatVersion,
    SerializationChunk
} from "@lionweb/core"
import {withoutAnnotations} from "@lionweb/utilities"


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
                            children: [
                                "aConcept-instance-grandchild"
                            ]
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
                            children: [
                                "aConcept-instance-child"
                            ]
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
                        classifier: aConceptMetaPointer,
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

