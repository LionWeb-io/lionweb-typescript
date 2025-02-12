import {Id} from "./types.js"
import {currentReleaseVersion} from "./version.js"

export type MetaPointer = {
    language: string    // == key of Language
    version: string     // == version of Language
    key: string         // == key of either LanguageEntity or Feature or EnumerationLiteral
}

export type SerializedProperty = {
    property: MetaPointer
    value: (string | null)
}

export type SerializedContainment = {
    containment: MetaPointer
    children: Id[]
}

export type SerializedReferenceTarget = {
    reference: Id
    resolveInfo: string | null
}

export type SerializedReference = {
    reference: MetaPointer
    targets: SerializedReferenceTarget[]
}

/**
 * Type definition for an AST node serialized to JSON.
 */
export type SerializedNode = {
    id: Id
    classifier: MetaPointer
    properties: SerializedProperty[]
    containments: SerializedContainment[]
    references: SerializedReference[]
    annotations: Id[]
    parent: (Id | null)
}


export type SerializedLanguageReference = {
    key: string
    version: string
}


/**
 * The <em>current</em> version of the serialization format -
 *  should fundamentally equal `currentReleaseVersion`.
 */
export const currentSerializationFormatVersion = currentReleaseVersion


/**
 * Type definition for a serialization of a whole model to JSON.
 */
export type SerializationChunk = {
    serializationFormatVersion: string
    languages: SerializedLanguageReference[]
    nodes: SerializedNode[]
}

