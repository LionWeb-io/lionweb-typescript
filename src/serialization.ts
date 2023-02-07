import {Id} from "./types.ts"
import {unresolved} from "./references.ts"


/**
 * Type definition of a reference that's serialized as JSON.
 */
export type SerializedRef = Id | typeof unresolved

/**
 * Type definition for an AST node serialized to JSON.
 */
export type SerializedNode = {
    concept: string
    id: string
    properties?: { [featureName: string]: string }
    children?: { [featureName: string]: Id[] }
    references?: { [featureName: string]: SerializedRef[] }
    parent?: Id
}


/**
 * Type definition for a serialization of a whole model to JSON.
 */
export type SerializedModel = {
    serializationFormatVersion: number,
    nodes: SerializedNode[]
}
// TODO  rename -> Serialization?

