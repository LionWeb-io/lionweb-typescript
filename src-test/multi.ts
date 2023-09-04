import {hashingIdGen} from "../src/id-generation.ts"
import {ModelAPI, updateSettings} from "../src/api.ts"
import {multiLanguage} from "./m3/multi-language.ts"
import {Concept, Node} from "../src/mod.ts"
import {Book, BookType, GuideBookWriter, Library} from "./library.ts"
import {libraryLanguage} from "./m3/library-language.ts"
import {nameBasedConceptDeducerFor} from "../src/m3/functions.ts"

export type BaseNode = Node & {
    concept: string
}

export type Container = Node & {
    concept: "Container",
    libraries: Library[]
}


export const  multiModelApi: ModelAPI<BaseNode> = {
    conceptOf: (node) => {
        // this is NOT how this should be implemented!
        let concept = nameBasedConceptDeducerFor(multiLanguage)(node.concept);
        if (!concept) {
            concept = nameBasedConceptDeducerFor(libraryLanguage)(node.concept);
        }
        return concept as Concept;
    },
    getFeatureValue: (node, feature) => (node as any)[feature.name],
    enumerationLiteralFrom: () => null,
    nodeFor: (_parent, concept, id, _settings) => ({
        id,
        concept: concept.name
    }),
    setFeatureValue: updateSettings,
    encodingOf: () => null
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

const container: Container = {
    id: id("MyContainer"),
    concept: "Container",
    libraries: [bobLibrary]
}

export const multiModel: BaseNode[] = [
    container
]

