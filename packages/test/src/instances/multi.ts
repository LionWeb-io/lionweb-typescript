import { ExtractionFacade, nameBasedClassifierDeducerFor } from "@lionweb/core"
import { hasher } from "@lionweb/utilities"
import { libraryLanguage } from "../languages/library.js"
import { multiLanguage } from "../languages/multi.js"
import { BaseNode } from "./base.js"
import { bobLibrary, jackLondon, Library, libraryExtractionFacade } from "./library.js"

export type Container = BaseNode & {
    classifier: "Container"
    libraries: Library[]
}

export const multiExtractionFacade: ExtractionFacade<BaseNode> = {
    ...libraryExtractionFacade,
    /* override */ classifierOf: node =>
        nameBasedClassifierDeducerFor(libraryLanguage)(node.classifier) ?? nameBasedClassifierDeducerFor(multiLanguage)(node.classifier)
}

const hash = hasher()

const container: Container = {
    id: hash("MyContainer"),
    classifier: "Container",
    libraries: [bobLibrary],
    annotations: []
}

export const multiModel: BaseNode[] = [
    container,
    jackLondon // (A library does not CONTAIN the authors of its books.)
]
