import { childrenExtractorUsing, DynamicNode, dynamicReader, idOf, nodesExtractorUsing } from "@lionweb/core"
import { AnotherConcept, SomeAnnotation, SomeConcept } from "../languages/generic.js"
import { deepEqual } from "../test-utils/assertions.js"

const subnode = {
    id: "subnode",
    classifier: AnotherConcept,
    settings: {},
    annotations: [
        {
            id: "annotation",
            classifier: SomeAnnotation,
            settings: {},
            annotations: []
        }
    ]
}

const node: DynamicNode = {
    id: "node",
    classifier: SomeConcept,
    settings: {
        children: subnode
    },
    annotations: []
}

describe("annotations are extracted", () => {

    it("by childrenExtractorUsing", () => {
        deepEqual(childrenExtractorUsing(dynamicReader)(node).map(idOf), ["subnode"])
        deepEqual(childrenExtractorUsing(dynamicReader)(subnode).map(idOf), ["annotation"])
    })

    it("by nodesExtractorUsing", () => {
        deepEqual(nodesExtractorUsing(dynamicReader)(node).map(idOf), ["node", "subnode", "annotation"])
    })

})

