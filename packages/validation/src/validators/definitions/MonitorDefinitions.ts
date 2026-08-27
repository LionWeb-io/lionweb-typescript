import type { MessageGroup } from "../generic/schema/SyntaxDefinition.js";

export const MonitorDefinitions: MessageGroup = {
    name: "Monitor",
    taggedUnionProperty: "messageKind",
    sharedProperties: [
        {
            name: "queryId",
            type: "QueryId",
            isList: false,
            isOptional: false,
            mayBeNull: false,
        },
        {
            name: "messageKind",
            type: "String",
            isList: false,
            isOptional: false,
            mayBeNull: false,
        },
        {
            name: "additionalInfos",
            type: "AdditionalInfo",
            isList: true,
            isOptional: false,
            mayBeNull: false,
        },
    ],
    messages: [
        {
            name: "Custom_MonitorStart",
            properties: [
                {
                    name: "repositoryName",
                    type: "String",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
                {
                    name: "queryId",
                    type: "QueryId",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
                {
                    name: "messageKind",
                    type: "String",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
                {
                    name: "additionalInfos",
                    type: "AdditionalInfo",
                    isList: true,
                    isOptional: false,
                    mayBeNull: false,
                },
            ],
        },
        {
            name: "Custom_MonitorEnd",
            properties: [
                {
                    name: "repositoryName",
                    type: "String",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
                {
                    name: "queryId",
                    type: "QueryId",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
                {
                    name: "messageKind",
                    type: "String",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
                {
                    name: "additionalInfos",
                    type: "AdditionalInfo",
                    isList: true,
                    isOptional: false,
                    mayBeNull: false,
                },
            ],
        },
    ],
};
