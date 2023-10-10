import {hashingIdGen} from "@lionweb/utilities"
import {ExtractionFacade, nameBasedClassifierDeducerFor, Node} from "@lionweb/core"
import {libraryLanguage} from "../languages/library.js"
import {multiLanguage} from "../languages/multi.js"
import {BaseNode, bobLibrary, isBaseNodeOfAnyOfTypes, jackLondon, Library, libraryExtractionFacade} from "./library.js"


export type Container = Node & {
    classifier: "Container",
    libraries: Library[]
}


export const multiExtractionFacade: ExtractionFacade<BaseNode> = {
    ...libraryExtractionFacade,
    /* override */ supports: (node) =>
        libraryExtractionFacade.supports(node) || isBaseNodeOfAnyOfTypes("Container")(node),
    /* override */ classifierOf: (node) =>
        libraryExtractionFacade.supports(node)
            ? nameBasedClassifierDeducerFor(libraryLanguage)(node.classifier)
            : nameBasedClassifierDeducerFor(multiLanguage)(node.classifier),
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

