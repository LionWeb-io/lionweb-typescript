import type { TypeGroup } from "../generic/schema/SyntaxDefinition.js";

export const DeltaTypesDefinitions: TypeGroup = {
    name: "DeltaTypes",
    primitiveTypes: [
        {
            name: "String",
            primitiveType: "string",
        },
        {
            name: "SequenceNumber",
            primitiveType: "number",
        },
        {
            name: "CommandId",
            primitiveType: "string",
        },
        {
            name: "ParticipationId",
            primitiveType: "string",
        },
        {
            name: "Number",
            primitiveType: "number",
        },
        {
            name: "QueryId",
            primitiveType: "string",
        },
        {
            name: "Boolean",
            primitiveType: "boolean",
        },
        {
            name: "ClientId",
            primitiveType: "string",
        },
    ],
    structuredTypes: [
        {
            name: "AdditionalInfo",
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
                    isList: true,
                    isOptional: false,
                    mayBeNull: false,
                },
                {
                    name: "distribute",
                    type: "Boolean",
                    isList: false,
                    isOptional: true,
                    mayBeNull: false,
                },
            ],
        },
        {
            name: "KeyValuePair",
            properties: [
                {
                    name: "key",
                    type: "String",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
                {
                    name: "value",
                    type: "String",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
            ],
        },
        {
            name: "CommandSource",
            properties: [
                {
                    name: "participationId",
                    type: "ParticipationId",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
                {
                    name: "commandId",
                    type: "CommandId",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
            ],
        },
        {
            name: "LionWebDeltaJsonChunk",
            properties: [
                {
                    name: "nodes",
                    type: "LionWebJsonNode",
                    isList: true,
                    isOptional: false,
                    mayBeNull: false,
                },
            ],
        },
    ],
};
