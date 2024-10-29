import {assert, expect} from "chai"
const {deepEqual, equal} = assert

import {
    AggregatingSimplisticHandler,
    Concept,
    currentSerializationFormatVersion,
    DefaultPrimitiveTypeDeserializer,
    deserializeChunk,
    deserializeSerializationChunk,
    dynamicInstantiationFacade,
    Feature,
    InstantiationFacade,
    Language,
    Reference,
    SerializationChunk,
    unresolved
} from "@lionweb/core"
import {BaseNode} from "./instances/base.js"
import {libraryInstantiationFacade} from "./instances/library.js"
import {libraryLanguage} from "./languages/library.js"
import {dateDatatype, libraryWithDatesLanguage} from "./languages/libraryWithDates.js"


type NodeWithProperties = BaseNode & {properties:Record<string, unknown>}

export const libraryWithDatesInstantiationFacade: InstantiationFacade<BaseNode> = {
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
        const serializationChunk: SerializationChunk = {
            serializationFormatVersion: currentSerializationFormatVersion,
            languages: [
                {
                    "key": "library",
                    "version": "1"
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
        const deserialization = deserializeSerializationChunk(serializationChunk, libraryInstantiationFacade,
            [libraryLanguage], [])
        deepEqual(
            deserialization,
            [
                {
                    id: "1",
                    classifier: "Library",
                    annotations: []
                }   // is instantiated despite its serialization specifying a non-null parent ID that's not resolvable within the serialization chunk
            ]
        )
    })

    it("deserializes node with custom primitive type, without registering custom deserializer, leading to empty model (and console messages)", () => {
        const serializationChunk: SerializationChunk = {
            serializationFormatVersion: currentSerializationFormatVersion,
            languages: [
                {
                    "key": "library-with-dates",
                    "version": "1"
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
            deserializeSerializationChunk(serializationChunk, libraryWithDatesInstantiationFacade, [libraryWithDatesLanguage], []),
            []  // because instantiation fails, but instantiation is effectively a flatmap
        )
    })

    it("deserializes node with custom primitive type, works when registering custom deserializer", () => {
        const serializationChunk: SerializationChunk = {
            serializationFormatVersion: currentSerializationFormatVersion,
            languages: [
                {
                    "key": "libraryWithDates",
                    "version": "1"
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
        const primitiveTypeDeserializer = new DefaultPrimitiveTypeDeserializer();
        primitiveTypeDeserializer.register(dateDatatype, (value) => {
            const parts = value.split("-");
            return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
        })

        const deserialization = deserializeSerializationChunk(serializationChunk, libraryWithDatesInstantiationFacade,
            [libraryWithDatesLanguage], [],
            primitiveTypeDeserializer)

        const node = deserialization[0] as NodeWithProperties;
        expect(node.properties["creationDate"]).to.eql(new Date(2024, 4, 28))
    })

    it("skips nodes with unknown classifier, leading to an empty model (and console messages)", () => {
        const serializationChunk: SerializationChunk = {
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
        deepEqual(deserializeSerializationChunk(serializationChunk, dynamicInstantiationFacade, [], []), [])
    })

    it("doesn't throw for unresolvable references", () => {
        const someLanguage = new Language("someLanguage", "0", "someLanguage", "someLanguage")
        const someConcept = new Concept(someLanguage, "someConcept", "someConcept", "someConcept", false)
        someLanguage.havingEntities(someConcept)
        const someConcept_aReference = new Reference(someConcept, "someConcept-aReference", "someConcept-aReference", "someConcept-aReference")
        someConcept.havingFeatures(someConcept_aReference)

        const serializationChunk: SerializationChunk = {
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

        const model = deserializeSerializationChunk(serializationChunk, dynamicInstantiationFacade, [someLanguage], [])
        equal(model.length, 1)
        deepEqual(model[0].settings, { [someConcept_aReference.key]: unresolved })
    })

    it("aggregates problems", () => {
        const aggregator = new AggregatingSimplisticHandler()
        deserializeChunk({
            // misses "serializationFormatVersion"
            languages: [],
            nodes: []
        } as unknown as SerializationChunk, dynamicInstantiationFacade, [], [], undefined, aggregator)
        aggregator.reportAllProblemsOnConsole(true)
        deepEqual(
            Object.entries(aggregator.allProblems()),
            [
                [`can't deserialize from serialization format other than version "${currentSerializationFormatVersion}" - assuming that version`, 1]
            ]
        )
    })

})

