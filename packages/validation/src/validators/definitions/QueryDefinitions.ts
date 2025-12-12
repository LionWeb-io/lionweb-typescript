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
            name: "protocolMessages",
            type: "ProtocolMessage",
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
            name: "SubscribeToChangingPartitions",
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
            name: "SubscribeToPartitionContents",
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
            name: "UnsubscribeFromPartitionContents",
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
            name: "SignOn",
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
            name: "signOff",
            properties: [],
        },
        {
            name: "Reconnect",
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
            name: "GetAvailableIds",
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
            name: "ListPartitions",
            properties: [],
        },
    ],
};
