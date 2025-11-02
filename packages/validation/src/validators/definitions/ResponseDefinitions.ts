import { MessageGroup } from "../generic/schema/SyntaxDefinition.js";

export const ResponseDefinitions: MessageGroup = {
    name: "Response",
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
    ],
    messages: [
        {
            name: "SubscribeToChangingPartitionsResponse",
            properties: [],
        },
        {
            name: "SubscribeToPartitionContentsResponse",
            properties: [
                {
                    name: "contents",
                    type: "LionWebDeltaJsonChunk",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
            ],
        },
        {
            name: "UnsubscribeFromPartitionContentsResponse",
            properties: [],
        },
        {
            name: "SignOnResponse",
            properties: [
                {
                    name: "participationId",
                    type: "ParticipationId",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
            ],
        },
        {
            name: "signOffResponse",
            properties: [],
        },
        {
            name: "ReconnectResponse",
            properties: [
                {
                    name: "lastSentSequenceNumber",
                    type: "SequenceNumber",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
            ],
        },
        {
            name: "GetAvailableIdsResponse",
            properties: [
                {
                    name: "ids",
                    type: "LionWebId",
                    isList: true,
                    isOptional: false,
                    mayBeNull: false,
                },
            ],
        },
        {
            name: "ListPartitionsResponse",
            properties: [
                {
                    name: "partitions",
                    type: "LionWebDeltaJsonChunk",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
            ],
        },
    ],
};
