import type { TypeGroup } from "../generic/schema/SyntaxDefinition.js";

export const ChunksDefinitions: TypeGroup = {
    name: "Chunks",
    primitiveTypes: [
        {
            name: "LionWebId",
            primitiveType: "string",
        },
        {
            name: "LionWebKey",
            primitiveType: "string",
        },
        {
            name: "LionWebVersion",
            primitiveType: "string",
        },
        {
            name: "LionWebSerializationFormatVersion",
            primitiveType: "string",
        },
    ],
    structuredTypes: [
        {
            name: "LionWebJsonMetaPointer",
            properties: [
                {
                    name: "key",
                    type: "LionWebKey",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
                {
                    name: "version",
                    type: "LionWebVersion",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
                {
                    name: "language",
                    type: "LionWebKey",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
            ],
        },
        {
            name: "ResponseMessage",
            properties: [
                {
                    name: "kind",
                    type: "String",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
                {
                    name: "message",
                    type: "String",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
                {
                    name: "data",
                    type: "KeyValuePair",
                    isList: false,
                    isOptional: true,
                    mayBeNull: true,
                },
            ],
        },
        {
            name: "LionWebJsonChunk",
            properties: [
                {
                    name: "serializationFormatVersion",
                    type: "LionWebSerializationFormatVersion",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
                {
                    name: "languages",
                    type: "LionWebJsonUsedLanguage",
                    isList: true,
                    isOptional: false,
                    mayBeNull: false,
                },
                {
                    name: "nodes",
                    type: "LionWebJsonNode",
                    isList: true,
                    isOptional: false,
                    mayBeNull: false,
                },
            ],
        },
        {
            name: "LionWebJsonUsedLanguage",
            properties: [
                {
                    name: "key",
                    type: "LionWebKey",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
                {
                    name: "version",
                    type: "LionWebVersion",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
            ],
        },
        {
            name: "LionWebJsonNode",
            properties: [
                {
                    name: "id",
                    type: "LionWebId",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
                {
                    name: "classifier",
                    type: "LionWebJsonMetaPointer",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
                {
                    name: "properties",
                    type: "LionWebJsonProperty",
                    isList: true,
                    isOptional: false,
                    mayBeNull: false,
                },
                {
                    name: "containments",
                    type: "LionWebJsonContainment",
                    isList: true,
                    isOptional: false,
                    mayBeNull: false,
                },
                {
                    name: "references",
                    type: "LionWebJsonReference",
                    isList: true,
                    isOptional: false,
                    mayBeNull: false,
                },
                {
                    name: "annotations",
                    type: "LionWebId",
                    isList: true,
                    isOptional: false,
                    mayBeNull: false,
                },
                {
                    name: "parent",
                    type: "LionWebId",
                    isList: false,
                    isOptional: false,
                    mayBeNull: true,
                },
            ],
        },
        {
            name: "LionWebJsonProperty",
            properties: [
                {
                    name: "property",
                    type: "LionWebJsonMetaPointer",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
                {
                    name: "value",
                    type: "String",
                    isList: false,
                    isOptional: false,
                    mayBeNull: true,
                },
            ],
        },
        {
            name: "LionWebJsonContainment",
            properties: [
                {
                    name: "containment",
                    type: "LionWebJsonMetaPointer",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
                {
                    name: "children",
                    type: "LionWebId",
                    isList: true,
                    isOptional: false,
                    mayBeNull: false,
                },
            ],
        },
        {
            name: "LionWebJsonReference",
            properties: [
                {
                    name: "reference",
                    type: "LionWebJsonMetaPointer",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
                {
                    name: "targets",
                    type: "LionWebJsonReferenceTarget",
                    isList: true,
                    isOptional: false,
                    mayBeNull: false,
                },
            ],
        },
        {
            name: "LionWebJsonReferenceTarget",
            properties: [
                {
                    name: "resolveInfo",
                    type: "String",
                    isList: false,
                    isOptional: false,
                    mayBeNull: true,
                },
                {
                    name: "reference",
                    type: "LionWebId",
                    isList: false,
                    isOptional: false,
                    mayBeNull: true,
                },
            ],
        },
    ],
};
