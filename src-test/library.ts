import {Node} from "../src/types.ts"
import {hashingIdGen} from "../src/id-generation.ts"
import {ModelAPI, updateSettings} from "../src/api.ts"
import {nameBasedConceptDeducerFor} from "../src/m3/functions.ts"
import {libraryLanguage} from "./m3/library-language.ts"


export enum BookType {
    Normal,
    Special,
}

export type BaseNode = Node & {
    concept: string
}

export type Book = BaseNode & {
    concept: "Book"
    title: string
    pages: number
    author: Writer
    type?: BookType
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
    conceptOf: (node) => nameBasedConceptDeducerFor(libraryLanguage)(node.concept),
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
    pages: 1337,
    type: BookType.Special
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


