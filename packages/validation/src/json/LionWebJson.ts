import { LION_CORE_M3_KEY, LION_CORE_M3_VERSION } from "./M3definitions.js"

/**
 * The types defining the structure of the LionWeb JSON format.
 * @see https://lionweb-io.github.io/specification/serialization/serialization.html
 * We use types instead of classes, because the purpose is to define the Lionweb JSON to be sent over the line.
 */


export function isLionWebM3Language(language: LwJsonUsedLanguage): boolean {
    return language.key === LION_CORE_M3_KEY && language.version === LION_CORE_M3_VERSION
}
export type LionWebId = string

export type LionWebJsonMetaPointer = {
    language: string
    version: string
    key: string             // key of concept, property, containment, referenve or property
}

export function isEqualMetaPointer(p1: LionWebJsonMetaPointer, p2: LionWebJsonMetaPointer): boolean {
    return p1.key === p2.key && p1.version === p2.version && p1.language === p2.language
}

export function isEqualReferenceTarget(first: LionWebJsonReferenceTarget, second: LionWebJsonReferenceTarget): boolean {
    return first.reference === second.reference && first.resolveInfo === second.resolveInfo
}

export type LionWebJsonChunk = {
    serializationFormatVersion: string
    languages: LwJsonUsedLanguage[]
    nodes: LionWebJsonNode[]
}

export type LwJsonUsedLanguage = {
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

export function createLwNode(): LionWebJsonNode {
    return {
        id: "",
        classifier: { language: "", version: "", key: "" },
        properties: [],
        containments: [],
        references: [],
        annotations: [],
        parent: null,
    }
}

export type LionWebJsonProperty = {
    property: LionWebJsonMetaPointer
    value: string
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
    resolveInfo?: string
    reference: LionWebId
}
