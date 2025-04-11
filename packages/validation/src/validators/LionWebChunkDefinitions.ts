import { MAY_BE_NULL, PropertyDef, PropertyDefinition } from "./generic/ValidationTypes.js"
import { validateId, validateKey, validateSerializationFormatVersion, validateVersion } from "./ValidationFunctions.js"

/**
 * The structure below defines the structure of a LionWeb Chunk by defining all the properties.
 * It can
 *   - be fed to the SyntaxValidator to validate an object sat runtime.
 *   - used to generate all the types for a LionWebChunk.
 */
export const expectedTypes: Map<string, TypeDefinition> = new Map<string, TypeDefinition>([
    [
        "LionWebMetaPointer",
        [
            PropertyDef({ property: "key", expectedType: "LionWebKey" }),
            PropertyDef({ property: "version", expectedType: "LionWebVersion" }),
            PropertyDef({ property: "language", expectedType: "LionWebKey" })
        ]
    ],
    [
        "ResponseMessage",
        [
            PropertyDef({ property: "kind", expectedType: "string" }),
            PropertyDef({ property: "message", expectedType: "string" }),
            PropertyDef({ property: "data", expectedType: "object", mayBeNull: true, isOptional: true })
        ]
    ],
    [
        "LionWebChunk",
        [
            PropertyDef({ property: "serializationFormatVersion", expectedType: "LionWebSerializationFormatVersion" }),
            PropertyDef({ property: "languages", expectedType: "LionWebUsedLanguage", isList: true }),
            PropertyDef({ property: "nodes", expectedType: "LionWebNode", isList: true })
        ]
    ],
    [
        "LionWebUsedLanguage",
        [
            PropertyDef({ property: "key", expectedType: "LionWebKey" }),
            PropertyDef({ property: "version", expectedType: "LionWebVersion" })
        ]
    ],
    [
        "LionWebNode",
        [
            PropertyDef({ property: "id", expectedType: "LionWebId" }),
            PropertyDef({ property: "classifier", expectedType: "LionWebMetaPointer" }),
            PropertyDef({ property: "properties", expectedType: "LionWebProperty", isList: true }),
            PropertyDef({ property: "containments", expectedType: "LionWebContainment", isList: true }),
            PropertyDef({ property: "references", expectedType: "LionWebReference", isList: true }),
            PropertyDef({ property: "annotations", expectedType: "LionWebId", isList: true }),
            PropertyDef({ property: "parent", expectedType: "LionWebId", mayBeNull: MAY_BE_NULL }),
        ]
    ],
    [
        "LionWebProperty",
        [
            PropertyDef({ property: "property", expectedType: "LionWebMetaPointer" }),
            PropertyDef({ property: "value", expectedType: "string", mayBeNull: MAY_BE_NULL }),
        ]
    ],
    [
        "LionWebContainment",
        [
            PropertyDef({ property: "containment", expectedType: "LionWebMetaPointer" }),
            PropertyDef({ property: "children", expectedType: "LionWebId", isList: true }),
        ]
    ],
    [
        "LionWebReference",
        [
            PropertyDef({ property: "reference", expectedType: "LionWebMetaPointer"}),
            PropertyDef({ property: "targets", expectedType: "LionWebReferenceTarget", isList: true}),
        ]
    ],
    [
        "LionWebReferenceTarget",
        [
            PropertyDef({ property: "resolveInfo", expectedType: "string", mayBeNull: MAY_BE_NULL }),
            PropertyDef({ property: "reference", expectedType: "LionWebId", mayBeNull: MAY_BE_NULL }),
        ]
    ],
    /**
     * Elements without properties are assumed to be JSON/JS primitive values, and tested using `typeof`
     * and the (optional) validate function.
     */
    [
        "LionWebId",
        PrimitiveDef({ primitiveType: "string", validate: validateId }),
    ],
    [
        "LionWebKey",
        PrimitiveDef({ primitiveType: "string", validate: validateKey }),
    ],
    [
        "LionWebVersion",
        PrimitiveDef({ primitiveType: "string", validate: validateVersion }),
    ],
    [
        "LionWebSerializationFormatVersion",
        PrimitiveDef({ primitiveType: "string", validate: validateSerializationFormatVersion }),
    ],
    [
        "string",
        PrimitiveDef({ primitiveType: "string" }),
    ],
    [
        "object",
        PrimitiveDef({ primitiveType: "object" }),
    ]
])




