import {Id, Node} from "./types.ts"
import {SingleRef, unresolved} from "./references.ts"


/**
 * Type definition of a reference that's serialized as JSON.
 */
export type SerializedRef = Id | typeof unresolved


/**
 * Convenience/helper function to map a single-valued reference (which might be optional)
 * to an array of {@link SerializedRef}s (which then has at most one element).
 */
export const asRefIds = <T extends Node>(ref?: SingleRef<T>): SerializedRef[] => {
    if (ref === undefined) {
        return []
    }
    if (ref === unresolved) {
        return [unresolved]
    }
    return [(ref as T).id]
}


/**
 * Type definition for an AST node serialized to JSON.
 */
export type SerializedNode = {
    type: string
    id: string
    properties?: { [featureName: string]: string | boolean }
    children?: { [featureName: string]: Id[] }
    references?: { [featureName: string]: SerializedRef[] }
    parent?: Id
}

