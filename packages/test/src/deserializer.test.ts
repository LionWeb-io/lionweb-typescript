import { assert, expect } from "chai"
const {deepEqual} = assert

import {
    currentSerializationFormatVersion,
    deserializeSerializationChunk, Feature, InstantiationFacade,
    PrimitiveTypeSerializer,
    SerializationChunk, updateSettingsNameBased
} from "@lionweb/core"
import { BaseNode, libraryInstantiationFacade } from "./instances/library.js"
import {libraryLanguage} from "./languages/library.js"
import { dateDatatype, libraryWithDates, libraryWithDatesLanguage } from "./languages/libraryWithDates.js"

export const libraryWithDatesInstantiationFacade: InstantiationFacade<BaseNode> = {
    nodeFor: (_parent, classifier, id, _propertySettings) => ({
        id,
        classifier: classifier.key,
        annotations: [],
        properties: {}
    }),
    setFeatureValue: (node: any, feature: Feature, value: unknown) => {
        node.properties[feature.name] = value
    },
    encodingOf: (literal) => {
        throw new Error()
    }
}


describe("deserialization", () => {

    it("deserializes all nodes, also when there are effectively no root nodes", () => {
        const serializationChunk: SerializationChunk = {
            serializationFormatVersion: currentSerializationFormatVersion,
            "languages": [
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
                            new PrimitiveTypeSerializer(),
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

    it("deserializes node with custom primitive type, without registering custom deserializer", () => {
        const serializationChunk: SerializationChunk = {
            serializationFormatVersion: currentSerializationFormatVersion,
            "languages": [
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
        expect(() => deserializeSerializationChunk(serializationChunk, libraryWithDatesInstantiationFacade,
            new PrimitiveTypeSerializer(),
            [libraryWithDatesLanguage], []))
            .to.throw();
    })

    it("deserializes node with custom primitive type, works when registering custom deserializer", () => {
        const serializationChunk: SerializationChunk = {
            serializationFormatVersion: currentSerializationFormatVersion,
            "languages": [
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
        const primitiveTypeSerializer = new PrimitiveTypeSerializer();
        primitiveTypeSerializer.registerDeserializer(dateDatatype, (value)=> {
            const parts = value.split("-");
            return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
        })

        const deserialization = deserializeSerializationChunk(serializationChunk, libraryWithDatesInstantiationFacade,
            primitiveTypeSerializer,
            [libraryWithDatesLanguage], [])

        const node = deserialization[0] as any;
        expect(node.properties["creationDate"]).to.eql(new Date(2024, 4, 28))
    })

})

