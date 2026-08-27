import type { MessageGroup } from "../generic/schema/SyntaxDefinition.js";

export const AdminResponseDefinitions: MessageGroup = {
    name: "AdminResponse",
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
            name: "Custom_ListRepositoriesAdminResponse",
            properties: [
                {
                    name: "repositories",
                    type: "RepositoryInfo",
                    isList: true,
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
            name: "Custom_CreateRepositoryAdminResponse",
            properties: [
                {
                    name: "newRepositoryName",
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
            name: "Custom_DeleteRepositoryAdminResponse",
            properties: [
                {
                    name: "deletedRepositoryName",
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
            name: "Custom_RenameRepositoryAdminResponse",
            properties: [
                {
                    name: "oldRepositoryName",
                    type: "String",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
                {
                    name: "newRepositoryName",
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
