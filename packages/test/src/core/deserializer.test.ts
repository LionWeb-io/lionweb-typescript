import {
    AggregatingProblemReporter,
    builtinPrimitives,
    Concept,
    deserializerWith,
    dynamicWriter,
    Feature,
    Language,
    newPropertyValueDeserializerRegistry,
    propertyValueDeserializerFrom,
    Reference,
    unresolved,
    Writer
} from "@lionweb/core"
import { currentSerializationFormatVersion, LionWebJsonChunk } from "@lionweb/json"
import { expect } from "chai"

import { BaseNode } from "../instances/base.js"
import { libraryWriter } from "../instances/library.js"
import { libraryLanguage } from "../languages/library.js"
import { dateDataType, libraryWithDatesLanguage } from "../languages/libraryWithDates.js"
import { deepEqual, equal } from "../test-utils/assertions.js"


type NodeWithProperties = BaseNode & { properties: Record<string, unknown> }

export const libraryWithDatesWriter: Writer<BaseNode> = {
    nodeFor: (_parent, classifier, id, _propertySettings) => ({
        id,
        classifier: classifier.key,
        annotations: [],
        properties: {}
    }),
    setFeatureValue: (node: BaseNode, feature: Feature, value: unknown) => {
        (node as NodeWithProperties).properties[feature.name] = value
    },
    encodingOf: () => {
        throw new Error("(should not be called)")
    }
}


describe("deserialization", () => {
    it("deserializes all nodes, also when there are effectively no root nodes", () => {
        const serializationChunk: LionWebJsonChunk = {
            serializationFormatVersion: currentSerializationFormatVersion,
            languages: [
                {
                    key: "library",
                    version: "1"
                }
            ],
            nodes: [
                {
                    id: "1",
                    classifier: {
                        language: "library",
                        version: "1",
                        key: "Library"
                    },
                    properties: [],
                    containments: [],
                    references: [],
                    annotations: [],
                    parent: "parent-not-resolvable"
                }
            ]
        }
        const deserialization = deserializerWith({ writer: libraryWriter, languages: [libraryLanguage] })(serializationChunk)
        deepEqual(deserialization, [
            {
                id: "1",
                classifier: "Library",
                annotations: []
            } // is instantiated despite its serialization specifying a non-null parent ID that's not resolvable within the serialization chunk
        ])
    })

    it("deserializes node with custom primitive type, without registering custom deserializer, leading to empty model (and console messages)", () => {
        const serializationChunk: LionWebJsonChunk = {
            serializationFormatVersion: currentSerializationFormatVersion,
            languages: [
                {
                    key: "library-with-dates",
                    version: "1"
                }
            ],
            nodes: [
                {
                    id: "1",
                    classifier: {
                        language: "library-with-dates",
                        version: "1",
                        key: "Library"
                    },
                    properties: [
                        {
                            property: {
                                language: "library-with-dates",
                                version: "1",
                                key: "Library-creation-date"
                            },
                            value: "2024-05-28"
                        }
                    ],
                    containments: [],
                    references: [],
                    annotations: [],
                    parent: null
                }
            ]
        }
        deepEqual(
            deserializerWith({ writer: libraryWithDatesWriter, languages: [libraryWithDatesLanguage] })(serializationChunk),
            [] // because instantiation fails, but instantiation is effectively a flatmap
        )
    })

    it("deserializes node with custom primitive type, works when registering custom deserializer", () => {
        const serializationChunk: LionWebJsonChunk = {
            serializationFormatVersion: currentSerializationFormatVersion,
            languages: [
                {
                    key: "libraryWithDates",
                    version: "1"
                }
            ],
            nodes: [
                {
                    id: "1",
                    classifier: {
                        language: "libraryWithDates",
                        version: "1",
                        key: "LibraryWithDates"
                    },
                    properties: [
                        {
                            property: {
                                language: "libraryWithDates",
                                version: "1",
                                key: "library_Library_creationDate"
                            },
                            value: "2024-05-28"
                        }
                    ],
                    containments: [],
                    references: [],
                    annotations: [],
                    parent: null
                }
            ]
        }
        const propertyValueDeserializer = propertyValueDeserializerFrom(
            newPropertyValueDeserializerRegistry()
                .set(builtinPrimitives.stringDataType, (value) => value)
                .set(dateDataType, (value) => {
                    const parts = value.split("-")
                    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
                })
        )
        const deserialization = deserializerWith({
            writer: libraryWithDatesWriter,
            languages: [libraryWithDatesLanguage],
            propertyValueDeserializer
        })(serializationChunk)

        const node = deserialization[0] as NodeWithProperties
        expect(node.properties["creationDate"]).to.eql(new Date(2024, 4, 28))
    })

    it("skips nodes with unknown classifier, leading to an empty model (and console messages)", () => {
        const serializationChunk: LionWebJsonChunk = {
            serializationFormatVersion: currentSerializationFormatVersion,
            languages: [],
            nodes: [
                {
                    id: "foo",
                    classifier: {
                        language: "lang",
                        version: "ver",
                        key: "unknown-classifier"
                    },
                    properties: [],
                    containments: [],
                    references: [],
                    annotations: [],
                    parent: null
                }
            ]
        }
        deepEqual(deserializerWith({ writer: dynamicWriter, languages: [] })(serializationChunk), [])
    })

    it("doesn't throw for unresolvable references", () => {
        const someLanguage = new Language("someLanguage", "0", "someLanguage", "someLanguage")
        const someConcept = new Concept(someLanguage, "someConcept", "someConcept", "someConcept", false)
        someLanguage.havingEntities(someConcept)
        const someConcept_aReference = new Reference(
            someConcept,
            "someConcept-aReference",
            "someConcept-aReference",
            "someConcept-aReference"
        )
        someConcept.havingFeatures(someConcept_aReference)

        const serializationChunk: LionWebJsonChunk = {
            serializationFormatVersion: currentSerializationFormatVersion,
            languages: [
                {
                    key: "someLanguage",
                    version: "0"
                }
            ],
            nodes: [
                {
                    id: "foo",
                    classifier: {
                        language: "someLanguage",
                        version: "0",
                        key: "someConcept"
                    },
                    properties: [],
                    containments: [],
                    references: [
                        {
                            reference: {
                                language: "someLanguage",
                                version: "0",
                                key: "someConcept-aReference"
                            },
                            targets: [
                                {
                                    reference: "bar",
                                    resolveInfo: "unresolvable bar"
                                }
                            ]
                        }
                    ],
                    annotations: [],
                    parent: null
                }
            ]
        }

        const model = deserializerWith({ writer: dynamicWriter, languages: [someLanguage] })(serializationChunk)
        equal(model.length, 1)
        deepEqual(model[0].settings, { [someConcept_aReference.key]: unresolved })
    })

    it("aggregates problems", () => {
        const problemReporter = new AggregatingProblemReporter()
        deserializerWith({
            writer: dynamicWriter,
            languages: [],
            problemReporter
        })(
            {
                // misses "serializationFormatVersion"
                languages: [],
                nodes: []
            } as unknown as LionWebJsonChunk,
        )
        problemReporter.reportAllProblemsOnConsole(true)
        deepEqual(Object.entries(problemReporter.allProblems()), [
            [
                `can't deserialize from serialization format other than version "${currentSerializationFormatVersion}" - assuming that version`,
                1
            ]
        ])
    })
})

