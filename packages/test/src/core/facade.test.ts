import { childrenExtractorUsing, idOf, nodesExtractorUsing } from "@lionweb/core"

import { nodeBaseReader } from "@lionweb/class-core"
import { LinkTestConcept, TestAnnotation } from "@lionweb/class-core-test-language"
import { deepEqual } from "../test-utils/assertions.js"

const anno = TestAnnotation.create("annotation")
const subnode = LinkTestConcept.create("subnode")
subnode.addAnnotation(anno)

const node = LinkTestConcept.create("node") as LinkTestConcept
node.containment_1 = subnode

describe("annotations are extracted", () => {

    it("by childrenExtractorUsing", () => {
        deepEqual(childrenExtractorUsing(nodeBaseReader)(node).map(idOf), ["subnode"])
        deepEqual(childrenExtractorUsing(nodeBaseReader)(subnode).map(idOf), ["annotation"])
    })

    it("by nodesExtractorUsing", () => {
        deepEqual(nodesExtractorUsing(nodeBaseReader)(node).map(idOf), ["node", "subnode", "annotation"])
    })

})

