import {
    AggregatingProblemReporter,
    ConceptModifier,
    deserializerWith,
    dynamicWriter,
    Feature,
    LanguageFactory,
    LionWebVersions,
    newPropertyValueDeserializerRegistry,
    propertyValueDeserializerFrom,
    UnresolvedReference,
    Writer
} from "@lionweb/core"
import { LionWebJsonChunk } from "@lionweb/json"
import { expect } from "chai"

import { BaseNode } from "../instances/base.js"
import { libraryWriter } from "../instances/library.js"
import { libraryLanguage } from "../languages/library.js"
import { dateDataType, libraryWithDatesLanguage } from "../languages/libraryWithDates.js"
import { deepEqual, equal, isTrue } from "../test-utils/assertions.js"
import { StringsMapper } from "@lionweb/ts-utils"


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
            serializationFormatVersion: LionWebVersions.v2023_1.serializationFormatVersion,
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
            serializationFormatVersion: LionWebVersions.v2023_1.serializationFormatVersion,
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
            serializationFormatVersion: LionWebVersions.v2023_1.serializationFormatVersion,
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
                .set(LionWebVersions.v2023_1.builtinsFacade.primitiveTypes.stringDataType, (value) => value)
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
            serializationFormatVersion: LionWebVersions.v2023_1.serializationFormatVersion,
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

    const idAndKeyGenerator: StringsMapper = (...names) => names.length === 1 ? names[0] : names.slice(1).join("-")
    const factory = new LanguageFactory("someLanguage", "0", idAndKeyGenerator, idAndKeyGenerator)
    const someLanguage = factory.language
    const someConcept = factory.concept("someConcept", ConceptModifier.concrete)
    const aContainment = factory.containment(someConcept, "aContainment")
    const aReference = factory.reference(someConcept, "aReference")

    it("doesn't throw for unresolvable references", () => {
        const serializationChunk: LionWebJsonChunk = {
            serializationFormatVersion: LionWebVersions.v2023_1.serializationFormatVersion,
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

        const problemReporter = new AggregatingProblemReporter()
        const model = deserializerWith({ writer: dynamicWriter, languages: [someLanguage], problemReporter })(serializationChunk)
        deepEqual(Object.entries(problemReporter.allProblems()), [
            [
                `couldn't resolve the target with id=bar of a "aReference" reference on the node with id=foo`,
                1
            ]
        ])
        equal(model.length, 1)
        const ref = model[0].settings[aReference.key]
        isTrue(ref instanceof UnresolvedReference)
        const {targetId, resolveInfo} = ref as UnresolvedReference
        equal(targetId, "bar")
        equal(resolveInfo, "unresolvable bar")
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
                `can't deserialize from serialization format other than version "${LionWebVersions.v2023_1.serializationFormatVersion}" - assuming that version`,
                1
            ]
        ])
    })

    it("reports on serialized nodes that can’t be deserialized, and doesn’t add/set `null`", () => {
        const serializationChunk: LionWebJsonChunk = {
            serializationFormatVersion: LionWebVersions.v2023_1.serializationFormatVersion,
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
                    containments: [
                        {
                            containment: {
                                language: "someLanguage",
                                version: "0",
                                key: "someConcept-aContainment"
                            },
                            children: [ "bar" ] // no node with ID "bar" in this chunk
                        }
                    ],
                    references: [],
                    annotations: [],
                    parent: null
                }
            ]
        }

        const problemReporter = new AggregatingProblemReporter()
        const model = deserializerWith({ writer: dynamicWriter, languages: [someLanguage], problemReporter })(serializationChunk)
        deepEqual(Object.entries(problemReporter.allProblems()), [
            [
                `child with id=bar doesn’t reside in this serialization chunk, so can’t add it to containment aContainment on node with id=foo`,
                1
            ]
        ])
        equal(model[0].settings[aContainment.key], undefined)
    })

})

