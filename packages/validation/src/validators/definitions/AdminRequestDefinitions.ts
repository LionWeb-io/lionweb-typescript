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
            name: "ListRepositoriesAdminRequest",
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
            name: "CreateRepositoryAdminRequest",
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
            name: "DeleteRepositoryAdminRequest",
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
            name: "RenameRepositoryAdminRequest",
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
