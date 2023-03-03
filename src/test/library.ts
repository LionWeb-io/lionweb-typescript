import {Node} from "../types.ts"
import {hashingIdGen} from "../id-generation.ts"
import {ModelAPI, updateSettings} from "../api.ts"
import {nameBasedConceptDeducerFor} from "../m3/functions.ts"
import {libraryMetamodel} from "../m3/test/library-meta.ts"


export type BaseNode = Node & {
    concept: string
}

export type Book = BaseNode & {
    concept: "Book"
    title: string
    pages: number
    author: Writer
}

export type Library = BaseNode & {
    concept: "Library"
    name: string
    books: Book[]
}

export type Writer = {   // abstract
    name: string
}

export type GuideBookWriter = Writer & BaseNode & {
    concept: "GuideBookWriter"
    countries: string
}

export type SpecialistBookWriter = Writer & BaseNode & {
    concept: "SpecialistBookWriter"
    subject: string
}


export const libraryModelApi: ModelAPI<BaseNode> = {
    conceptOf: (node) => nameBasedConceptDeducerFor(libraryMetamodel)(node.concept),
    getFeatureValue: (node, feature) => (node as any)[feature.name],
    nodeFor: (_parent, concept, id, _settings) => ({
        id,
        concept: concept.name
    }),
    setFeatureValue: updateSettings
}


const id = hashingIdGen()

const jackLondon: GuideBookWriter = {
    id: id("Jack London"),
    concept: "GuideBookWriter",
    name: "Jack London",
    countries: "Alaska" // (not a country...)
}

const explorerBook: Book = {
    id: id("Explorer Book"),
    concept: "Book",
    title: "Explorer Book",
    author: jackLondon,
    pages: 1337
}

const bobLibrary: Library = {
    id: id("Bob's Library"),
    concept: "Library",
    name: "Bob's Library",
    books: [
        explorerBook
    ]
}

export const libraryModel: BaseNode[] = [
    bobLibrary,
    jackLondon
]

// TODO  instantiate exact same library as Federico?


