import {hashingIdGen} from "../src/id-generation.ts"
import {ModelAPI} from "../src/api.ts"
import {multiLanguage} from "./m3/multi-language.ts"
import {Node} from "../src/mod.ts"
import {bobLibrary, jackLondon, Library, libraryModelApi} from "./library.ts"
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
    ...libraryModelApi,
    conceptOf: (node) =>
        nameBasedConceptDeducerFor(libraryLanguage)(node.concept)
            ??
        nameBasedConceptDeducerFor(multiLanguage)(node.concept),
}


const id = hashingIdGen()

const container: Container = {
    id: id("MyContainer"),
    concept: "Container",
    libraries: [
        bobLibrary
    ]
}

export const multiModel: BaseNode[] = [
    container,
    jackLondon  // (A library does not CONTAIN the authors of its books.)
]

