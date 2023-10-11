import {hashingIdGen} from "@lionweb/utilities"
import {ExtractionFacade, nameBasedClassifierDeducerFor, Node} from "@lionweb/core"
import {multiLanguage} from "../languages/multi.js"
import {BaseNode, bobLibrary, jackLondon, Library, libraryExtractionFacade} from "./library.js"
import {libraryLanguage} from "../languages/library.js"


export type Container = Node & {
    classifier: "Container",
    libraries: Library[]
}


export const multiExtractionFacade: ExtractionFacade<BaseNode> = {
    ...libraryExtractionFacade,
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

