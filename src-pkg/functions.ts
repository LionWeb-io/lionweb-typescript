import {Id, Node} from "./types.js"
import {flatMapNonCyclingFollowing, trivialFlatMapper} from "./utils/recursion.js"


/**
 * @return a list of itself and the ancestors of the given {@link Node node}, in anti-chronological order.
 */
export const containmentChain = (node: Node): Node[] => {
    const getParent = (t: Node): Node[] => t.parent === undefined ? [] : [t.parent]
    return flatMapNonCyclingFollowing(trivialFlatMapper, getParent)(node)
}


/**
 * Maps an array of {@link Node AST nodes} to their IDs.
 */
export const asIds = (nodes: Node[]): Id[] =>
    nodes.map(({id}) => id)

