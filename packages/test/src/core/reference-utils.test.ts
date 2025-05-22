import {
    Classifier,
    dynamicExtractionFacade,
    dynamicInstantiationFacade,
    DynamicNode,
    incomingReferences,
    referencesToOutOfScopeNodes,
    ReferenceValue,
    referenceValues
} from "@lionweb/core"
import { LionWebId } from "@lionweb/json"

import { AnotherConcept, SomeAnnotation, SomeAnnotation_ref, SomeConcept, SomeConcept_ref } from "../languages/generic.js"
import { MyConcept, MyConcept_multivaluedRef, MyConcept_singularRef } from "../languages/tiny-ref.js"
import { deepEqual } from "../test-utils/assertions.js"

/*
 * These unit tests are pretty much a straight-up copy of the ones in the ReferenceUtilsTests class in the LionWeb C# implementation:
 * https://github.com/LionWeb-io/lionweb-csharp/blob/main/test/LionWeb-CSharp-Test/tests/ReferenceUtilsTests.cs .
 */

describe("reference utils", () => {
    const createNode = (id: LionWebId, classifier: Classifier): DynamicNode => ({
        id,
        classifier,
        settings: {},
        annotations: []
    })
    const setValue = dynamicInstantiationFacade.setFeatureValue

    it("find a reference from a feature of a concept", () => {
        const targetNode = createNode("target", AnotherConcept)
        const sourceNode = createNode("source", SomeConcept)
        setValue(sourceNode, SomeConcept_ref, targetNode)
        const scope = [sourceNode, targetNode]

        const expectedRefs = [new ReferenceValue(sourceNode, targetNode, SomeConcept_ref, null)]
        deepEqual(referenceValues(scope, dynamicExtractionFacade), expectedRefs)
        deepEqual(incomingReferences(targetNode, scope, dynamicExtractionFacade), expectedRefs)
    })

    it("find a reference from an annotation", () => {
        const targetNode = createNode("target", SomeConcept)
        const sourceNode = createNode("source", SomeAnnotation)
        setValue(sourceNode, SomeAnnotation_ref, targetNode)
        const sourceContainer = createNode("sourceContainer", AnotherConcept)
        sourceNode.annotations.push(sourceNode)
        const scope = [sourceContainer, sourceNode, targetNode]

        /*
         * Note: this doesn't actually test anything new relative to the 1st test,
         * because the annotation [instance] has a reference just like a concept instance has,
         * and because the annotation is explicitly declared as part of the scope.
         * It's more interesting to verify that a scope computed from root nodes would contain the annotation!
         */
        deepEqual(incomingReferences(targetNode, scope, dynamicExtractionFacade), [
            new ReferenceValue(sourceNode, targetNode, SomeAnnotation_ref, null)
        ])
    })

    it("find a reference to itself", () => {
        const node = createNode("node", MyConcept)
        setValue(node, MyConcept_singularRef, node)

        deepEqual(incomingReferences(node, [node], dynamicExtractionFacade), [new ReferenceValue(node, node, MyConcept_singularRef, null)])
    })

    it("find references in different features of the source", () => {
        const targetNode = createNode("target", MyConcept)
        const sourceNode = createNode("source", MyConcept)
        setValue(sourceNode, MyConcept_singularRef, targetNode)
        setValue(sourceNode, MyConcept_multivaluedRef, targetNode)
        deepEqual(sourceNode.settings["multivaluedRef"], [targetNode]) // assert that setValue(<node>, <multivalued feature>, <value>) _added_ the value

        deepEqual(incomingReferences(targetNode, [sourceNode], dynamicExtractionFacade), [
            new ReferenceValue(sourceNode, targetNode, MyConcept_singularRef, null),
            new ReferenceValue(sourceNode, targetNode, MyConcept_multivaluedRef, 0)
        ])
    })

    it("find multiple references to target in a multivalued feature of the source", () => {
        const targetNode = createNode("target", MyConcept)
        const sourceNode = createNode("source", MyConcept)
        setValue(sourceNode, MyConcept_multivaluedRef, targetNode)
        setValue(sourceNode, MyConcept_multivaluedRef, targetNode)
        deepEqual(sourceNode.settings["multivaluedRef"], [targetNode, targetNode]) // assert that setValue(<node>, <multivalued feature>, <value>) _added_ the values

        deepEqual(incomingReferences(targetNode, [sourceNode], dynamicExtractionFacade), [
            new ReferenceValue(sourceNode, targetNode, MyConcept_multivaluedRef, 0),
            new ReferenceValue(sourceNode, targetNode, MyConcept_multivaluedRef, 1)
        ])
    })

    it("find references among multiple sources and targets", () => {
        const sourceNode1 = createNode("sourceNode1", MyConcept)
        const sourceNode2 = createNode("sourceNode2", MyConcept)
        const targetNode1 = createNode("targetNode1", MyConcept)
        const targetNode2 = createNode("targetNode2", MyConcept)
        setValue(sourceNode1, MyConcept_singularRef, targetNode1)
        setValue(sourceNode2, MyConcept_singularRef, targetNode2)

        deepEqual(incomingReferences([targetNode1, targetNode2], [sourceNode1, sourceNode2], dynamicExtractionFacade), [
            new ReferenceValue(sourceNode1, targetNode1, MyConcept_singularRef, null),
            new ReferenceValue(sourceNode2, targetNode2, MyConcept_singularRef, null)
        ])
    })

    it("have defined behavior for duplicate target nodes", () => {
        const targetNode = createNode("target", AnotherConcept)
        const sourceNode = createNode("source", SomeConcept)
        setValue(sourceNode, SomeConcept_ref, targetNode)
        const scope = [sourceNode, targetNode]

        const expectedRefs = [new ReferenceValue(sourceNode, targetNode, SomeConcept_ref, null)]
        const duplicateTargetNodes = [targetNode, targetNode]
        deepEqual(incomingReferences(duplicateTargetNodes, scope, dynamicExtractionFacade), expectedRefs)
        deepEqual(referenceValues(scope, dynamicExtractionFacade), expectedRefs)
    })

    it("have defined behavior when duplicate nodes in scope", () => {
        const targetNode = createNode("target", AnotherConcept)
        const sourceNode = createNode("source", SomeConcept)
        setValue(sourceNode, SomeConcept_ref, targetNode)
        const scope = [sourceNode, targetNode]

        const expectedRefs = [new ReferenceValue(sourceNode, targetNode, SomeConcept_ref, null)]
        const duplicateScope = [...scope, ...scope]
        deepEqual(incomingReferences(targetNode, duplicateScope, dynamicExtractionFacade), expectedRefs)
        deepEqual(referenceValues(duplicateScope, dynamicExtractionFacade), expectedRefs)
    })

    it("find unreachable nodes", () => {
        const targetNode = createNode("target", AnotherConcept)
        const sourceNode = createNode("source", SomeConcept)
        setValue(sourceNode, SomeConcept_ref, targetNode)

        deepEqual(
            referencesToOutOfScopeNodes([sourceNode, sourceNode], dynamicExtractionFacade), // Note: scope is duplicate
            [new ReferenceValue(sourceNode, targetNode, SomeConcept_ref, null)]
        )
    })
})
