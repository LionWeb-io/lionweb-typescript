/**
 * The types defining the structure of the LionWeb JSON format.
 * @see https://lionweb-io.github.io/specification/serialization/serialization.html
 * We use types instead of classes, because the purpose is to define the Lionweb JSON to be sent over the line.
 */

/**
 * LionWebId of LionWeb node.
 */
export type LionWebId = string

/**
 * Key of classifier or feature.
 */
export type LionWebKey = string

/**
 * Serialization version of a chunk
 */
export type LionWebSerializationFormatVersion = string;

/**
 * The version of LionWeb
 */
export type LionWebVersion = string;

/**
 * Pointer to a classifier or feature in a version of a language.
 */
export type LionWebJsonMetaPointer = {
    language: LionWebKey
    version: LionWebVersion
    /**
     * The key of the classifier or feature pointed to.
     */
    key: LionWebKey
}

export type LionWebJsonChunk = {
    serializationFormatVersion: LionWebSerializationFormatVersion
    languages: LionWebJsonUsedLanguage[]
    nodes: LionWebJsonNode[]
}

export type LionWebJsonUsedLanguage = {
    key: LionWebKey
    version: LionWebVersion
}

export type LionWebJsonNode = {
    id: LionWebId
    classifier: LionWebJsonMetaPointer
    properties: LionWebJsonProperty[]
    containments: LionWebJsonContainment[]
    references: LionWebJsonReference[]
    annotations: LionWebId[]
    parent: LionWebId | null
}

export type LionWebJsonProperty = {
    property: LionWebJsonMetaPointer
    value: string | null
}

export type LionWebJsonContainment = {
    containment: LionWebJsonMetaPointer
    children: LionWebId[]
}

export type LionWebJsonReference = {
    reference: LionWebJsonMetaPointer
    targets: LionWebJsonReferenceTarget[]
}

/**
 * Type definition for a reference target, expressing that
 * either the `reference` (which is an {@link LionwebId}) or the (string-typed) `resolveInfo` is `null`,
 * but not both.
 */
export type LionWebJsonReferenceTarget =
    | {
        reference: LionWebId
        resolveInfo: string | null
    }
    | {
        reference: LionWebId | null
        resolveInfo: string
    }

