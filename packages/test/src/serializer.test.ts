import { expect } from "chai"

import {
    currentSerializationFormatVersion,
    Feature,
    SerializationChunk,
    serializeNodes,
    Id,
    ExtractionFacade,
    Classifier,
    Enumeration,
    EnumerationLiteral,
    Language,
    Property, Containment, DefaultPrimitiveTypeSerializer
} from "@lionweb/core"
import { BaseNode } from "./instances/library.js"
import { dateDatatype, libraryWithDatesLanguage } from "./languages/libraryWithDates.js"

class SimpleNode implements BaseNode {
    public properties: Record<string, unknown> = {}
    public containments: Record<string, SimpleNode[]> = {}
    public annotations: BaseNode[] = []

    constructor(public id: Id, public classifier: string) {
    }
}


class MyExtractionFacade implements ExtractionFacade<SimpleNode> {

    constructor(public knownLanguages: Language[] = []) {
    }

    classifierOf(node: SimpleNode): Classifier {
        const classifier = this.knownLanguages.map((l) => l.entities.find(e => e instanceof Classifier && e.name == node.classifier)).find((c) => c != null)
        if (classifier == null) {
            throw new Error(`Cannot find Classifier with given name ${node.classifier}`)
        }
        return classifier as Classifier
    }

    enumerationLiteralFrom(_encoding: unknown, _enumeration: Enumeration): EnumerationLiteral | null {
        throw new Error("Not supported")
    }

    getFeatureValue(node: SimpleNode, feature: Feature): unknown {
        if (feature instanceof Property) {
            const value = node.properties[feature.name]
            return value
        }
        if (feature instanceof Containment) {
            const value = node.containments[feature.name]
            if (feature.multiple) {
                if (value === undefined) {
                    return []
                } else {
                    return value as SimpleNode[]
                }
            } else {
                if (value === undefined || value.length == 0) {
                    return undefined
                } else {
                    return value[0]
                }
            }
        }
        throw new Error(`Not supported: feature ${feature.name}`)
    }

}

describe("serialization", () => {

    it("serializes node with custom primitive type, without registering custom deserializer", () => {
        const myNode = new SimpleNode("1", "LibraryWithDates")
        myNode.properties["name"] = "myLibrary"
        myNode.properties["creationDate"] = new Date(30, 4, 2024)
        myNode.containments["books"] = []

        expect(() => serializeNodes([myNode], new MyExtractionFacade([libraryWithDatesLanguage]))).to.throw()
    })

    it("serializes node with custom primitive type, works when registering custom deserializer", () => {
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
                                key: "library_Library_name"
                            },
                            value: "myLibrary"
                        },
                        {
                            property: {
                                language: "libraryWithDates",
                                version: "1",
                                key: "library_Library_creationDate"
                            },
                            value: "2024-05-28"
                        }
                    ],
                    containments: [
                        {
                            "children": [],
                            "containment": {
                                "key": "books",
                                "language": "libraryWithDates",
                                "version": "1"
                            }
                        }
                    ],
                    references: [],
                    annotations: [],
                    parent: null
                }
            ]
        }
        const primitiveTypeSerializer = new DefaultPrimitiveTypeSerializer()
        primitiveTypeSerializer.registerSerializer(dateDatatype, (value: unknown) => {
            const d = value as Date
            return `${Number(d.getFullYear()).toString().padStart(4, "0")}-${Number(d.getMonth() + 1).toString().padStart(2, "0")}-${Number(d.getDate()).toString().padStart(2, "0")}`
        })

        const myNode = new SimpleNode("1", "LibraryWithDates")
        myNode.properties["name"] = "myLibrary"
        myNode.properties["creationDate"] = new Date(2024, 4, 28)
        myNode.containments["books"] = []

        expect(serializeNodes([myNode], new MyExtractionFacade([libraryWithDatesLanguage]), primitiveTypeSerializer)).to.eql(serializationChunk)
    })

})

