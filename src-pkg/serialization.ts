import {Id} from "./types.js"


export type Ids = Id[]


export type MetaPointer = {
    language: string
    version: string
    key: string
}

export type SerializedProperty = {
    property: MetaPointer
    value: string
}

export type SerializedContainment = {
    containment: MetaPointer
    children: Ids
}

export type SerializedReferenceTarget = {
    resolveInfo?: string
    reference: Id
}

export type SerializedReference = {
    reference: MetaPointer
    targets: SerializedReferenceTarget[]
}

/**
 * Type definition for an AST node serialized to JSON.
 */
export type SerializedNode = {
    concept: MetaPointer
    id: string
    properties: SerializedProperty[]
    children: SerializedContainment[]
    references: SerializedReference[]
    parent: Id | null
}


export type SerializedLanguageReference = {
    key: string
    version: string
}


/**
 * The <em>current</em> version of the serialization format.
 */
export const currentSerializationFormatVersion = "2023.1"

/**
 * Type definition for a serialization of a whole model to JSON.
 */
export type SerializationChunk = {
    serializationFormatVersion: string
    languages: SerializedLanguageReference[]
    nodes: SerializedNode[]
}

