import type { MessageGroup } from "../generic/schema/SyntaxDefinition.js";

export const AdminRequestDefinitions: MessageGroup = {
    name: "AdminRequest",
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
            name: "Custom_ListRepositoriesAdminRequest",
            properties: [
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
            name: "Custom_CreateRepositoryAdminRequest",
            properties: [
                {
                    name: "repositoryName",
                    type: "String",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
                {
                    name: "lionWebVersion",
                    type: "String",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
                {
                    name: "history",
                    type: "Boolean",
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
            name: "Custom_DeleteRepositoryAdminRequest",
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
            name: "Custom_RenameRepositoryAdminRequest",
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
