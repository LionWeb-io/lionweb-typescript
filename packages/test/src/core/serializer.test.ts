import {
    Annotation,
    Concept,
    DynamicNode,
    dynamicReader,
    Enumeration,
    EnumerationLiteral,
    Language,
    LanguageFactory,
    lioncoreBuiltinsFacade,
    newPropertyValueSerializerRegistry,
    propertyValueSerializerFrom,
    Reference,
    serializeLanguages,
    serializerWith
} from "@lionweb/core"
import { currentSerializationFormatVersion, LionWebJsonChunk } from "@lionweb/json"
import { concatenator, lastOf } from "@lionweb/ts-utils"
import { expect } from "chai"
import { TestNode, TestNodeReader } from "../instances/test-node.js"
import { dateDataType, libraryWithDatesLanguage } from "../languages/libraryWithDates.js"

describe("serialization", () => {
    it("serializes node with custom primitive type, without registering custom deserializer", () => {
        const myNode = new TestNode("1", "LibraryWithDates")
        myNode.properties["name"] = "myLibrary"
        myNode.properties["creationDate"] = new Date(30, 4, 2024)
        myNode.containments["books"] = []

        expect(() => serializerWith({ reader: new TestNodeReader([libraryWithDatesLanguage]) })([myNode])).to.throw()
    })

    it("serializes node with custom primitive type, works when registering custom deserializer", () => {
        const builtinsPropertyValueSerializer = propertyValueSerializerFrom(
            newPropertyValueSerializerRegistry()
                .set(lioncoreBuiltinsFacade.primitiveTypes.stringDataType, (value) => value as string)
                .set(dateDataType, (value) => {
                    const d = value as Date
                    return `${Number(d.getFullYear()).toString().padStart(4, "0")}-${Number(d.getMonth() + 1)
                        .toString()
                        .padStart(2, "0")}-${Number(d.getDate()).toString().padStart(2, "0")}`
                }))
        const myNode = new TestNode("1", "LibraryWithDates")
        myNode.properties["name"] = "myLibrary"
        myNode.properties["creationDate"] = new Date(2024, 4, 28)
        myNode.containments["books"] = []

        const expectedSerializationChunk: LionWebJsonChunk = {
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
        expect(
            serializerWith({ reader: new TestNodeReader([libraryWithDatesLanguage]), propertyValueSerializer: builtinsPropertyValueSerializer })([myNode])
        )
            .to.eql(expectedSerializationChunk)
    })

    const { inamed } = lioncoreBuiltinsFacade.classifiers

    it("serializes annotations", () => {
        const language = new Language("test language", "0", "test-language", "test-language")
        const annotatedConcept = new Concept(language, "Annotated", "Annotated", "Annotated", false)
        annotatedConcept.implementing(inamed)
        const testAnnotation = new Annotation(language, "Annotation", "Annotation", "Annotation")
        testAnnotation.implementing(inamed)
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
                    annotations: ["0"],
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
        expect(serializerWith({ reader: new TestNodeReader([language]) })([annotatedNode], )).to.eql(expectedSerializationChunk)
    })

    it(`doesn't fail on "unconnected" (i.e., unset or previously unresolved) null reference target values`, () => {
        const language = new Language("test language", "0", "test-language", "test-language")
        const annotation = new Annotation(language, "Annotation", "Annotation", "Annotation")
        // don't set annotation.annotates!
        language.havingEntities(annotation)

        const serializationChunk = serializeLanguages(language) // should not fail
        const annotationSerNode = serializationChunk.nodes.find(node => node.id === "Annotation")
        expect(annotationSerNode).to.not.be.null
        const referenceSer = annotationSerNode?.references.find(serRef => serRef.reference.key === "Annotation-annotates")
        expect(referenceSer).to.not.be.undefined
        expect(referenceSer!.targets).to.eql([])
    })

    it(`doesn't fail on unresolved, i.e. null-valued child values`, () => {
        const language = new Language("test language", "0", "test-language", "test-language")
        const enumeration = new Enumeration(language, "Enumeration", "Enumeration", "Enumeration")
        enumeration.havingLiterals(null as unknown as EnumerationLiteral) // some type-trickery
        language.havingEntities(enumeration)

        const serializationChunk = serializeLanguages(language) // should not fail
        const enumerationSerNode = serializationChunk.nodes.find(node => node.id === "Enumeration")
        expect(enumerationSerNode).to.not.be.null
        const containmentSer = enumerationSerNode?.containments.find(
            serContainment => serContainment.containment.key === "Enumeration-literals"
        )
        expect(containmentSer).to.not.be.undefined
        expect(containmentSer!.children).to.eql([])

        // This test should also test a single-valued containment, and should ideally also not use the M3, but a regular M2/M1, because M3's (de-)serialization might be “peculiar”.
    })

    it(`correctly serializes a reference to a target without resolveInfo (serializing that as null)`, () => {
        const language = new Language("test language", "0", "test-language", "test-language")
        const concept = new Concept(language, "Concept", "Concept", "Concept", false)
        const selfRef = new Reference(concept, "selfRef", "Concept-selfRef", "Concept-selfRef").ofType(concept)
        concept.havingFeatures(selfRef)
        language.havingEntities(concept)

        const instance = new TestNode("instance", "Concept")
        instance.references["selfRef"] = [instance]
        const reader = new TestNodeReader([language])
        const serializationChunk = serializerWith({ reader: reader })([instance])

        const serNode = serializationChunk.nodes[0]
        expect(serNode).to.not.be.undefined
        const serSelfRef = serNode.references.find(serRef => serRef.reference.key === "Concept-selfRef")
        expect(serSelfRef).to.not.be.undefined
        expect(serSelfRef!.targets).to.deep.eq([{ reference: "instance", resolveInfo: null }])
    })
})


const { primitiveTypes } = lioncoreBuiltinsFacade

describe("serialization of empty (unset) values", () => {
    const factory = new LanguageFactory("serialization-language", "0", concatenator("-"), lastOf)
    const enumeration = factory.enumeration("enumeration")
    const concept = factory.concept("concept", false)
    factory.property(concept, "stringProperty").ofType(primitiveTypes.stringDataType).isOptional()
    factory.property(concept, "integerProperty").ofType(primitiveTypes.integerDataType).isOptional()
    factory.property(concept, "booleanProperty").ofType(primitiveTypes.booleanDataType).isOptional()
    factory.property(concept, "enumProperty").ofType(enumeration).isOptional()
    factory.containment(concept, "containment").ofType(concept).isOptional()
    factory.containment(concept, "containments").ofType(concept).isOptional().isMultiple()
    factory.reference(concept, "reference").ofType(concept).isOptional()
    factory.reference(concept, "references").ofType(concept).isOptional().isMultiple()

    const node: DynamicNode = {
        id: "foo",
        classifier: concept,
        settings: {},
        annotations: []
    }

    it("with skipEmptyValues = false (=default), empty values are serialized", () => {
        const expectedSerializationChunk: LionWebJsonChunk = {
            serializationFormatVersion: "2023.1",
            languages: [
                {
                    key: "serialization-language",
                    version: "0"
                }
            ],
            nodes: [
                {
                    id: "foo",
                    classifier: {
                        language: "serialization-language",
                        version: "0",
                        key: "concept"
                    },
                    properties: [
                        {
                            property: {
                                key: "stringProperty",
                                language: "serialization-language",
                                version: "0"
                            },
                            value: null
                        },
                        {
                            property: {
                                key: "integerProperty",
                                language: "serialization-language",
                                version: "0"
                            },
                            value: null
                        },
                        {
                            property: {
                                key: "booleanProperty",
                                language: "serialization-language",
                                version: "0"
                            },
                            value: null
                        },
                        {
                            property: {
                                key: "enumProperty",
                                language: "serialization-language",
                                version: "0"
                            },
                            value: null
                        }
                    ],
                    containments: [
                        {
                            containment: {
                                language: "serialization-language",
                                version: "0",
                                key: "containment"
                            },
                            children: []
                        },
                        {
                            containment: {
                                language: "serialization-language",
                                version: "0",
                                key: "containments"
                            },
                            children: []
                        }
                    ],
                    references: [
                        {
                            reference: {
                                language: "serialization-language",
                                version: "0",
                                key: "reference"
                            },
                            targets: []
                        },
                        {
                            reference: {
                                language: "serialization-language",
                                version: "0",
                                key: "references"
                            },
                            targets: []
                        }
                    ],
                    annotations: [],
                    parent: null
                }
            ]
        }
        const actualSerializationChunk = serializerWith({ reader: dynamicReader })([node]) // (serializeEmptyFeatures has true as default)
        expect(actualSerializationChunk).to.eql(expectedSerializationChunk)
        const usingExplicitOption = serializerWith({ reader: dynamicReader, serializeEmptyFeatures: true })([node])
        expect(usingExplicitOption).to.eql(expectedSerializationChunk)
    })

    it("with skipEmptyValues = true, empty values are not serialized", () => {
        const expectedSerializationChunk: LionWebJsonChunk = {
            serializationFormatVersion: "2023.1",
            languages: [
                {
                    key: "serialization-language",
                    version: "0"
                }
            ],
            nodes: [
                {
                    id: "foo",
                    classifier: {
                        language: "serialization-language",
                        version: "0",
                        key: "concept"
                    },
                    properties: [],
                    containments: [],
                    references: [],
                    annotations: [],
                    parent: null
                }
            ]
        }
        const actualSerializationChunk = serializerWith({ reader: dynamicReader, serializeEmptyFeatures: false })([node])
        expect(actualSerializationChunk).to.eql(expectedSerializationChunk)
    })
})

describe("serialization of a language", () => {
    it("doesn't fail when an annotation doesn't specify what it annotates", () => {
        const factory = new LanguageFactory("annotation-language", "0", concatenator("-"), lastOf)
        factory.annotation("annotation")
        const serializationChunk = serializeLanguages(factory.language)
        const annotationNode = serializationChunk.nodes.find(node => node.id === "annotation-language-annotation")
        expect(annotationNode).to.not.be.undefined
        const serializedReference = annotationNode!.references.find(serRef => serRef.reference.key === "Annotation-annotates")
        expect(serializedReference).to.not.be.undefined
        expect(serializedReference!.targets).to.eql([])
    })
})

