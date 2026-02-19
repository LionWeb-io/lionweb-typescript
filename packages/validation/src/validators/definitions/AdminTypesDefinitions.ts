import type { TypeGroup } from "../generic/schema/SyntaxDefinition.js";

export const AdminTypesDefinitions: TypeGroup = {
    name: "AdminTypes",
    primitiveTypes: [],
    structuredTypes: [
        {
            name: "RepositoryInfo",
            properties: [
                {
                    name: "name",
                    type: "String",
                    isList: false,
                    isOptional: false,
                    mayBeNull: false,
                },
                {
                    name: "lionweb_version",
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
            ],
        },
    ],
};
