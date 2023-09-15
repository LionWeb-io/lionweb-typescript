import {hashingIdGen} from "../../src-utils/id-generation.js"
import {ModelAPI, nameBasedConceptDeducerFor, Node} from "../../src-pkg/index.js"
import {multiLanguage} from "../languages/multi.js"
import {bobLibrary, jackLondon, Library, libraryModelApi} from "./library.js"
import {libraryLanguage} from "../languages/library.js"


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

