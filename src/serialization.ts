import {Id} from "./types.ts"


export type Ids = Id[]


/**
 * Type definition for an AST node serialized to JSON.
 */
export type SerializedNode = {
    concept: string
    id: string
    properties: { [featureName: string]: string }
    children: { [featureName: string]: Ids }
    references: { [featureName: string]: Ids }
    parent?: Id
}


/**
 * Type definition for a serialization of a whole model to JSON.
 */
export type SerializedModel = {
    serializationFormatVersion: number
    nodes: SerializedNode[]
}
// TODO  rename -> Serialization?

