import {hashingIdGen} from "@lionweb/utilities"
import {nameBasedClassifierDeducerFor, Node, ReadModelAPI} from "@lionweb/core"
import {multiLanguage} from "../languages/multi.js"
import {BaseNode, bobLibrary, jackLondon, Library, libraryReadModelAPI} from "./library.js"
import {libraryLanguage} from "../languages/library.js"


export type Container = Node & {
    classifier: "Container",
    libraries: Library[]
}


export const multiReadModelAPI: ReadModelAPI<BaseNode> = {
    ...libraryReadModelAPI,
    /* override */ classifierOf: (node) =>
        nameBasedClassifierDeducerFor(libraryLanguage)(node.classifier)
        ??
        nameBasedClassifierDeducerFor(multiLanguage)(node.classifier),
}


const id = hashingIdGen()

const container: Container = {
    id: id("MyContainer"),
    classifier: "Container",
    libraries: [
        bobLibrary
    ]
}

export const multiModel: BaseNode[] = [
    container,
    jackLondon  // (A library does not CONTAIN the authors of its books.)
]

