import {Id, Node} from "./types.ts"
import {SingleRef, unresolved} from "./references.ts"


// Note: this type is serializable as JSON.
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


export type SerializedNode = {
    type: string
    id: string
    properties?: { [featureName: string]: string | boolean }
    children?: { [featureName: string]: Id[] }
    references?: { [featureName: string]: SerializedRef[] }
}

