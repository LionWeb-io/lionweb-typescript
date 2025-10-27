import { Reader } from "../reading.js"
import { allFeaturesOf, Reference } from "../m3/index.js"
import { Node } from "../types.js"


/**
 * Represents information about a source and target node related through a {@link Reference}.
 * An index of `null` means that the reference is (at most) single-valued.
 */
export class ReferenceValue<NT extends Node> {
    constructor(
        public readonly sourceNode: NT,
        public readonly targetNode: NT,
        public readonly reference: Reference,
        public readonly index: number | null
    ) {}
}


/**
 * Finds all references within the given scope, as {@link ReferenceValue reference values}.
 * To search within all nodes under a collection of root nodes,
 * use _child extraction_ to compute all nodes in the forest hanging off of those root nodes as scope.
 * Note that any reference is found uniquely,
 * i.e. the returned {@link ReferenceValue reference values} are pairwise distinct,
 * even if the scope passed contains duplicate nodes.
 *
 * @param scope - the {@link Node nodes} that are searched for references
 * @param reader - a {@link Reader} to reflect on nodes.
 * _Note_ that it's assumed that its {@link getFeatureValue} function doesn't throw.
 */
export const referenceValues = <NT extends Node>(
    scope: NT[],
    reader: Reader<NT>
): ReferenceValue<NT>[] => {
    const visit = (sourceNode: NT, reference: Reference): ReferenceValue<NT>[] => {
        if (reference.multiple) {
            const targetNodes = (reader.getFeatureValue(sourceNode, reference) ?? []) as NT[]
            return targetNodes
                .map((targetNode, index) =>
                    new ReferenceValue<NT>(sourceNode, targetNode, reference, index)
                )
        }

        const targetNode = reader.getFeatureValue(sourceNode, reference) as (NT | undefined)
        if (targetNode !== undefined) {
            return [new ReferenceValue<NT>(sourceNode, targetNode, reference, null)]
        }

        return []
    }

    return [...new Set(scope)]  // ~ .distinct()
        .flatMap((sourceNode) =>
            allFeaturesOf(reader.classifierOf(sourceNode))
                .filter((feature) => feature instanceof Reference)
                .map((feature) => feature as Reference)
                .flatMap((reference) => visit(sourceNode, reference))
        )
}


/**
 * Finds all references coming into the given target node or any of the given target nodes,
 * within the given scope, as {@link ReferenceValue reference values}.
 * To search within all nodes under a collection of root nodes,
 * use _child extraction_ to compute all nodes in the forest hanging off of those root nodes as scope.
 * Note that any reference is found uniquely,
 * i.e. the returned {@link ReferenceValue reference values} are pairwise distinct,
 * even if the given target nodes or scope contain duplicate nodes.
 *
 * @param targetNodeOrNodes - one or more target {@link Node nodes} for which the incoming references are searched
 * @param scope - the {@link Node nodes} that are searched for references
 * @param reader - a {@link Reader} to reflect on nodes.
 * _Note_ that it's assumed that its {@link getFeatureValue} function doesn't throw.
 */
export const incomingReferences = <NT extends Node>(
    targetNodeOrNodes: NT[] | NT,
    scope: NT[],
    reader: Reader<NT>
): ReferenceValue<NT>[] => {
    const targetNodes = Array.isArray(targetNodeOrNodes) ? targetNodeOrNodes : [targetNodeOrNodes]
    return referenceValues(scope, reader)
        .filter((referenceValue) => targetNodes.indexOf(referenceValue.targetNode) > -1)
}


/**
 * Finds all references to nodes that are not in the given scope, as {@link ReferenceValue reference values}.
 * To search within all nodes under a collection of root nodes,
 * use _child extraction_ to compute all nodes in the forest hanging off of those root nodes as scope.
 * Note that any reference is found uniquely,
 * i.e. the returned {@link ReferenceValue reference values} are pairwise distinct,
 * even if the given scope contains duplicate nodes.
 *
 * @param scope - the {@link Node nodes} that form the scope of “reachable” nodes
 * @param reader - a {@link Reader} to reflect on nodes.
 * _Note_ that it's assumed that its {@link getFeatureValue} function doesn't throw.
 */
export const referencesToOutOfScopeNodes = <NT extends Node>(
    scope: NT[],
    reader: Reader<NT>
): ReferenceValue<NT>[] =>
    referenceValues(scope, reader)
        .filter((referenceValue) => scope.indexOf(referenceValue.targetNode) === -1)

