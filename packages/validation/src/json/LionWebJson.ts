/**
 * The types defining the structure of the LionWeb JSON format.
 * @see https://lionweb-io.github.io/specification/serialization/serialization.html
 * We use types instead of classes, because the purpose is to define the Lionweb JSON to be sent over the line.
 */
export const LION_CORE_BUILTINS_KEY = "LionCore-builtins";
export const LION_CORE_BUILTINS_INAMED_NAME = "LionCore-builtins-INamed-name";

export const LIONWEB_BOOLEAN_TYPE = "LionCore-builtins-Boolean";
export const LIONWEB_JSON_TYPE = "LionCore-builtins-JSON";
export const LIONWEB_INTEGER_TYPE = "LionCore-builtins-Integer";
export const LIONWEB_STRING_TYPE = "LionCore-builtins-String";

export type Id = string;

export type LionWebJsonMetaPointer = {
    language: string;
    version: string;
    key: string;
};

export function isEqualMetaPointer(p1: LionWebJsonMetaPointer, p2: LionWebJsonMetaPointer): boolean {
    return p1.key === p2.key && p1.version === p2.version && p1.language === p2.language;
}

export type LionWebJsonChunk = {
    serializationFormatVersion: string;
    languages: LwJsonUsedLanguage[];
    nodes: LionWebJsonNode[];
};

export type LwJsonUsedLanguage = {
    key: string;
    version: string;
};

export type LionWebJsonNode = {
    id: Id;
    classifier: LionWebJsonMetaPointer;
    properties: LionWebJsonProperty[];
    containments: LionWebJsonChild[];
    references: LionWebJsonReference[];
    annotations: Id[];
    parent: Id | null;
};

export function createLwNode(): LionWebJsonNode {
    return {
        id: "",
        classifier: { language: "", version: "", key: "" },
        properties: [],
        containments: [],
        references: [],
        annotations: [],
        parent: null,
    };
}

export type LionWebJsonProperty = {
    property: LionWebJsonMetaPointer;
    value: string;
};

export type LionWebJsonChild = {
    containment: LionWebJsonMetaPointer;
    children: string[];
};

export type LionWebJsonReference = {
    reference: LionWebJsonMetaPointer;
    targets: LionWebJsonReferenceTarget[];
};

export type LionWebJsonReferenceTarget = {
    resolveInfo: string;
    reference: string;
};
