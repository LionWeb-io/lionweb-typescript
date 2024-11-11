import {expect} from "chai"

import {
    Annotation,
    builtinClassifiers,
    Concept,
    currentSerializationFormatVersion,
    DefaultPrimitiveTypeSerializer,
    Language,
    SerializationChunk,
    serializeLanguages,
    serializeNodes
} from "@lionweb/core"
import {dateDatatype, libraryWithDatesLanguage} from "./languages/libraryWithDates.js"
import {TestNode, TestNodeReader} from "./instances/test-node.js"


describe("serialization", () => {

    it("serializes node with custom primitive type, without registering custom deserializer", () => {
        const myNode = new TestNode("1", "LibraryWithDates")
        myNode.properties["name"] = "myLibrary"
        myNode.properties["creationDate"] = new Date(30, 4, 2024)
        myNode.containments["books"] = []

        expect(() => serializeNodes([myNode], new TestNodeReader([libraryWithDatesLanguage]))).to.throw()
    })

    it("serializes node with custom primitive type, works when registering custom deserializer", () => {
        const primitiveTypeSerializer = new DefaultPrimitiveTypeSerializer()
        primitiveTypeSerializer.register(dateDatatype, (value: unknown) => {
            const d = value as Date
            return `${Number(d.getFullYear()).toString().padStart(4, "0")}-${Number(d.getMonth() + 1).toString().padStart(2, "0")}-${Number(d.getDate()).toString().padStart(2, "0")}`
        })

        const myNode = new TestNode("1", "LibraryWithDates")
        myNode.properties["name"] = "myLibrary"
        myNode.properties["creationDate"] = new Date(2024, 4, 28)
        myNode.containments["books"] = []

        const expectedSerializationChunk: SerializationChunk = {
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
                            children: [],
                            containment: {
                                key: "books",
                                language: "libraryWithDates",
                                version: "1"
                            }
                        }
                    ],
                    references: [],
                    annotations: [],
                    parent: null
                }
            ]
        }
        expect(serializeNodes([myNode], new TestNodeReader([libraryWithDatesLanguage]), primitiveTypeSerializer)).to.eql(expectedSerializationChunk)
    })

    it("serializes annotations", () => {
        const language = new Language("test language", "0", "test-language", "test-language")
        const annotatedConcept = new Concept(language, "Annotated", "Annotated", "Annotated", false)
        annotatedConcept.implementing(builtinClassifiers.inamed)
        const testAnnotation = new Annotation(language, "Annotation", "Annotation", "Annotation")
        testAnnotation.implementing(builtinClassifiers.inamed)
        language.havingEntities(annotatedConcept, testAnnotation)

        const annotation = new TestNode("0", "Annotation")
        annotation.properties["name"] = "my annotation node"
        const annotatedNode = new TestNode("1", "Annotated")
        annotatedNode.properties["name"] = "my annotated node"
        annotatedNode.annotations.push(annotation)

        const expectedSerializationChunk = {
            serializationFormatVersion: "2023.1",
            languages: [
                {
                    key: "test-language",
                    version: "0"
                },
                {
                    key: "LionCore-builtins",
                    version: "2023.1"
                }
            ],
            nodes: [
                {
                    id: "1",
                    classifier: {
                        language: "test-language",
                        version: "0",
                        key: "Annotated"
                    },
                    properties: [
                        {
                            property: {
                                language: "LionCore-builtins",
                                version: "2023.1",
                                key: "LionCore-builtins-INamed-name"
                            },
                            value: "my annotated node"
                        }
                    ],
                    containments: [],
                    references: [],
                    annotations: [
                        "0"
                    ],
                    parent: null
                },
                {
                    id: "0",
                    classifier: {
                        language: "test-language",
                        version: "0",
                        key: "Annotation"
                    },
                    properties: [
                        {
                            property: {
                                language: "LionCore-builtins",
                                version: "2023.1",
                                key: "LionCore-builtins-INamed-name"
                            },
                            value: "my annotation node"
                        }
                    ],
                    containments: [],
                    references: [],
                    annotations: [],
                    parent: "1"
                }
            ]
        }
        expect(serializeNodes([annotatedNode], new TestNodeReader([language]))).to.eql(expectedSerializationChunk)
    })

    it(`doesn't fail on "unconnected" (i.e., unset or previously unresolved) null reference target values`, () => {
        const language = new Language("test language", "0", "test-language", "test-language")
        const annotation = new Annotation(language, "Annotation", "Annotation", "Annotation")
            // don't set annotation.annotates!
        language.havingEntities(annotation)

        const serializationChunk = serializeLanguages(language) // should not fail
        const annotationSerNode = serializationChunk.nodes.find((node) => node.id === "Annotation")
        expect(annotationSerNode).to.not.be.null
        const referenceSer = annotationSerNode?.references.find((serRef) => serRef.reference.key === "Annotation-annotates")
        expect(referenceSer).to.not.be.undefined
        expect(referenceSer!.targets).to.eql([])
    })

})

