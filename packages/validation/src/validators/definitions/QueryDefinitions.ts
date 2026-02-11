import { MessageGroup } from "../generic/schema/SyntaxDefinition.js";

export const QueryDefinitions: MessageGroup = {
    name: "Query",
    taggedUnionProperty: "messageKind",
    sharedProperties: [
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
    ],
    messages: [
        {
            name: "SubscribeToChangingPartitionsRequest",
            properties: [
                {
                    name: "creation",
                    type: "Boolean",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
                {
                    name: "deletion",
                    type: "Boolean",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
                {
                    name: "partitions",
                    type: "Boolean",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
            ],
        },
        {
            name: "SubscribeToPartitionContentsRequest",
            properties: [
                {
                    name: "partition",
                    type: "LionWebId",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
            ],
        },
        {
            name: "UnsubscribeFromPartitionContentsRequest",
            properties: [
                {
                    name: "partition",
                    type: "LionWebId",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
            ],
        },
        {
            name: "SignOnRequest",
            properties: [
                {
                    name: "deltaProtocolVersion",
                    type: "String",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
                {
                    name: "clientId",
                    type: "ClientId",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
                {
                    name: "repositoryId",
                    type: "String",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
            ],
        },
        {
            name: "signOffRequest",
            properties: [],
        },
        {
            name: "ReconnectRequest",
            properties: [
                {
                    name: "participationId",
                    type: "ParticipationId",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
                {
                    name: "lastReceivedSequenceNumber",
                    type: "EventSequenceNumber",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
            ],
        },
        {
            name: "GetAvailableIdsRequest",
            properties: [
                {
                    name: "count",
                    type: "Number",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
            ],
        },
        {
            name: "ListPartitionsRequest",
            properties: [],
        },
    ],
};
