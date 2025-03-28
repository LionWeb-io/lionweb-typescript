import {
    validateId,
    validateKey,
    validateSerializationFormatVersion,
    validateVersion
} from "./ValidationFunctions.js"
import { MAY_BE_NULL, PropertyDef, PropertyDefinition } from "./generic/ValidationTypes.js"

/**
 * The structure below defines the structure of a LionWeb Chunk by defining all the properties.
 * It can
 *   - be fed to the SyntaxValidator to validate an object sat runtime.
 *   - used to generate all the types for a LionWebChunk.
 */
export const expectedTypes: Map<string, PropertyDefinition[]> = new Map([
    [
        "LionWebMetaPointer",
        [
            PropertyDef({ property: "key", expectedType: "string", validate: validateKey }),
            PropertyDef({ property: "version", expectedType: "string", validate: validateVersion }),
            PropertyDef({ property: "language", expectedType: "string", validate: validateKey })
        ]
    ],
    [
        "ResponseMessage",
        [
            PropertyDef({ property: "kind", expectedType: "string" }),
            PropertyDef({ property: "message", expectedType: "string" }),
            PropertyDef({ property: "data", expectedType: "object", mayBeNull: true })
        ]
    ],
    [
        "LionWebChunk",
        [
            PropertyDef({ property: "serializationFormatVersion", expectedType: "string", validate: validateSerializationFormatVersion }),
            PropertyDef({ property: "languages", expectedType: "LionWebUsedLanguage", isList: true }),
            PropertyDef({ property: "nodes", expectedType: "LionWebNode", isList: true })
        ]
    ],
    [
        "LionWebUsedLanguage",
        [
            PropertyDef({ property: "key", expectedType: "string", validate: validateKey }),
            PropertyDef({ property: "version", expectedType: "string", validate: validateVersion })
        ]
    ],
    [
        "LionWebNode",
        [
            PropertyDef({ property: "id", expectedType: "string", validate: validateId }),
            PropertyDef({ property: "classifier", expectedType: "LionWebMetaPointer" }),
            PropertyDef({ property: "properties", expectedType: "LionWebProperty", isList: true }),
            PropertyDef({ property: "containments", expectedType: "LionWebContainment", isList: true }),
            PropertyDef({ property: "references", expectedType: "LionWebReference", isList: true }),
            PropertyDef({ property: "annotations", expectedType: "string", isList: true, validate: validateId }),
            PropertyDef({ property: "parent", expectedType: "string", mayBeNull: MAY_BE_NULL, validate: validateId }),
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
            PropertyDef({ property: "children", expectedType: "string", isList: true, validate: validateId }),
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
            PropertyDef({ property: "reference", expectedType: "string", mayBeNull: MAY_BE_NULL, validate: validateId }),
        ]
    ],
    /**
     * Elements without properties are assumed to be JSON/JS primitive values, and tsted using `typeof`.
     */
    [
        "string",
        []
    ],
    [
        "number",
        []
    ],
    [
        "boolean",
        []
    ],
])




