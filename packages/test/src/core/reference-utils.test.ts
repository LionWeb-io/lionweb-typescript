import { incomingReferences, referencesToOutOfScopeNodes, ReferenceValue, referenceValues } from "@lionweb/core"

import { deepEqual } from "../test-utils/assertions.js"
import { INodeBase, nodeBaseReader } from "@lionweb/class-core"
import {
    DataTypeTestConcept,
    LinkTestConcept,
    TestAnnotation,
    TestLanguageBase
} from "@lionweb/class-core-test-language"

/*
 * These unit tests were “inspired” by the ones in the ReferenceUtilsTests class in the LionWeb C# implementation:
 * https://github.com/LionWeb-io/lionweb-csharp/blob/main/test/LionWeb-CSharp-Test/tests/ReferenceUtilsTests.cs .
 */

const base = TestLanguageBase.INSTANCE

describe("reference utils", () => {

    it("find a reference from a feature of a concept", () => {
        const targetNode = LinkTestConcept.create("target")
        const sourceNode = LinkTestConcept.create("source")
        sourceNode.reference_1 = targetNode
        const scope = [sourceNode]

        const expectedRefs = [new ReferenceValue(sourceNode, targetNode, base.LinkTestConcept_reference_1, null)]
        deepEqual(referenceValues(scope, nodeBaseReader), expectedRefs)
        deepEqual(incomingReferences(targetNode, scope, nodeBaseReader), expectedRefs)
    })

    it("find a reference from an annotation", () => {
        const targetNode = LinkTestConcept.create("target")
        const sourceNode = TestAnnotation.create("source")
        sourceNode.ref = targetNode
        const sourceContainer = DataTypeTestConcept.create("sourceContainer")
        sourceContainer.addAnnotation(sourceNode)
        const scope = [sourceContainer, sourceNode]

        deepEqual(incomingReferences(targetNode, scope, nodeBaseReader), [
            new ReferenceValue<INodeBase>(sourceNode, targetNode, base.TestAnnotation_ref, null)
        ])
    })

    it("find a reference to itself", () => {
        const node = LinkTestConcept.create("node")
        node.reference_1 = node

        deepEqual(incomingReferences(node, [node], nodeBaseReader), [new ReferenceValue(node, node, base.LinkTestConcept_reference_1, null)])
    })

    it("find references in different features of the source", () => {
        const targetNode = LinkTestConcept.create("target")
        const sourceNode = LinkTestConcept.create("source")
        sourceNode.reference_1 = targetNode
        sourceNode.addReference_1_n(targetNode)
        deepEqual(sourceNode.reference_1_n, [targetNode]) // (this checks the previous statement)

        deepEqual(incomingReferences(targetNode, [sourceNode], nodeBaseReader), [
            new ReferenceValue(sourceNode, targetNode, base.LinkTestConcept_reference_1, null),
            new ReferenceValue(sourceNode, targetNode, base.LinkTestConcept_reference_1_n, 0)
        ])
    })

    it("find multiple references to target in a multivalued feature of the source", () => {
        const targetNode = LinkTestConcept.create("target")
        const sourceNode = LinkTestConcept.create("source")
        sourceNode.addReference_1_n(targetNode)
        sourceNode.addReference_1_n(targetNode)
        deepEqual(sourceNode.reference_1_n, [targetNode, targetNode]) // (this checks the previous statement)

        deepEqual(incomingReferences(targetNode, [sourceNode], nodeBaseReader), [
            new ReferenceValue(sourceNode, targetNode, base.LinkTestConcept_reference_1_n, 0),
            new ReferenceValue(sourceNode, targetNode, base.LinkTestConcept_reference_1_n, 1)
        ])
    })

    it("find references among multiple sources and targets", () => {
        const sourceNode1 = LinkTestConcept.create("sourceNode1")
        const sourceNode2 = LinkTestConcept.create("sourceNode2")
        const targetNode1 = LinkTestConcept.create("targetNode1")
        const targetNode2 = LinkTestConcept.create("targetNode2")
        sourceNode1.reference_1 = targetNode1
        sourceNode2.reference_0_1 = targetNode2

        deepEqual(incomingReferences([targetNode1, targetNode2], [sourceNode1, sourceNode2], nodeBaseReader), [
            new ReferenceValue(sourceNode1, targetNode1, base.LinkTestConcept_reference_1, null),
            new ReferenceValue(sourceNode2, targetNode2, base.LinkTestConcept_reference_0_1, null)
        ])
    })

    it("have defined behavior for duplicate target nodes", () => {
        const targetNode = LinkTestConcept.create("target")
        const sourceNode = LinkTestConcept.create("source")
        sourceNode.reference_1 = targetNode
        const scope = [sourceNode, targetNode]

        const expectedRefs = [new ReferenceValue(sourceNode, targetNode, base.LinkTestConcept_reference_1, null)]
        const duplicateTargetNodes = [targetNode, targetNode]
        deepEqual(incomingReferences(duplicateTargetNodes, scope, nodeBaseReader), expectedRefs)
        deepEqual(referenceValues(scope, nodeBaseReader), expectedRefs)
    })

    it("have defined behavior when duplicate nodes in scope", () => {
        const targetNode = LinkTestConcept.create("target")
        const sourceNode = LinkTestConcept.create("source")
        sourceNode.reference_1 = targetNode
        const scope = [sourceNode, targetNode]

        const expectedRefs = [new ReferenceValue(sourceNode, targetNode, base.LinkTestConcept_reference_1, null)]
        const duplicateScope = [...scope, ...scope]
        deepEqual(incomingReferences(targetNode, duplicateScope, nodeBaseReader), expectedRefs)
        deepEqual(referenceValues(duplicateScope, nodeBaseReader), expectedRefs)
    })

    it("find unreachable nodes", () => {
        const targetNode = LinkTestConcept.create("target")
        const sourceNode = LinkTestConcept.create("source")
        sourceNode.reference_1 = targetNode

        deepEqual(
            referencesToOutOfScopeNodes([sourceNode, sourceNode], nodeBaseReader), // Note: scope is duplicate
            [new ReferenceValue(sourceNode, targetNode, base.LinkTestConcept_reference_1, null)]
        )
    })

})

