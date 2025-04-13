/**
 * The types defining the structure of the LionWeb JSON format.
 * @see https://lionweb-io.github.io/specification/serialization/serialization.html
 * We use types instead of classes, because the purpose is to define the Lionweb JSON to be sent over the line.
 */

export type LionWebId = string
// key of concept, property, containment, referenve or property
export type LionWebKey = string

export type LionWebJsonMetaPointer = {
    language: string
    version: string
    key: LionWebKey
}

export type LionWebJsonChunk = {
    serializationFormatVersion: string
    languages: LionWebJsonUsedLanguage[]
    nodes: LionWebJsonNode[]
}

export type LionWebJsonUsedLanguage = {
    key: string
    version: string
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

export type LionWebJsonReferenceTarget = {
    reference: LionWebId
    resolveInfo: string | null
}
