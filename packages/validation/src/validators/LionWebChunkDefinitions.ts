import { DefinitionSchema,  MAY_BE_NULL, PropertyDef, PrimitiveDef } from "./generic/index.js"
import { validateId, validateKey, validateSerializationFormatVersion, validateVersion } from "./ValidationFunctions.js"

/**
 * The structure below defines the structure of a LionWeb Chunk by defining all the properties.
 * It can
 *   - be used by the SyntaxValidator to validate an object sat runtime.
 *   - used to generate all the TypeScript types for a LionWebChunk.
 */
export const LionWebSchema: DefinitionSchema = new DefinitionSchema([], [
    {
        name: "LionWebJsonMetaPointer",
        properties: [
            PropertyDef({ name: "key", type: "LionWebKey" }),
            PropertyDef({ name: "version", type: "LionWebVersion" }),
            PropertyDef({ name: "language", type: "LionWebKey" })
        ]
    },
    {
        name: "LionWebJsonMetaPointer",
        properties: [
            PropertyDef({ name: "key", type: "LionWebKey" }),
            PropertyDef({ name: "version", type: "LionWebVersion" }),
            PropertyDef({ name: "language", type: "LionWebKey" }),
        ]
    },
    {
        name: "ResponseMessage",
        properties: [
            PropertyDef({ name: "kind", type: "JSstring" }),
            PropertyDef({ name: "message", type: "JSstring" }),
            PropertyDef({ name: "data", type: "JSobject", mayBeNull: true, isOptional: true })
        ]
    },
    {
        name: "LionWebJsonChunk",
        properties: [
            PropertyDef({ name: "serializationFormatVersion", type: "LionWebSerializationFormatVersion" }),
            PropertyDef({ name: "languages", type: "LionWebJsonUsedLanguage", isList: true }),
            PropertyDef({ name: "nodes", type: "LionWebJsonNode", isList: true })
        ]
    },
    {
        name: "LionWebJsonUsedLanguage",
        properties: [
            PropertyDef({ name: "key", type: "LionWebKey" }),
            PropertyDef({ name: "version", type: "LionWebVersion" })
        ]
    },
    {
        name: "LionWebJsonNode",
        properties: [
            PropertyDef({ name: "id", type: "LionWebId" }),
            PropertyDef({ name: "classifier", type: "LionWebJsonMetaPointer" }),
            PropertyDef({ name: "properties", type: "LionWebJsonProperty", isList: true }),
            PropertyDef({ name: "containments", type: "LionWebJsonContainment", isList: true }),
            PropertyDef({ name: "references", type: "LionWebJsonReference", isList: true }),
            PropertyDef({ name: "annotations", type: "LionWebId", isList: true }),
            PropertyDef({ name: "parent", type: "LionWebId", mayBeNull: MAY_BE_NULL }),
        ]
    },
    {
        name: "LionWebJsonProperty",
        properties: [
            PropertyDef({ name: "property", type: "LionWebJsonMetaPointer" }),
            PropertyDef({ name: "value", type: "JSstring", mayBeNull: MAY_BE_NULL }),
        ]
    },
    {
        name: "LionWebJsonContainment",
        properties: [
            PropertyDef({ name: "containment", type: "LionWebJsonMetaPointer" }),
            PropertyDef({ name: "children", type: "LionWebId", isList: true }),
        ]
    },
    {
        name: "LionWebJsonReference",
        properties: [
            PropertyDef({ name: "reference", type: "LionWebJsonMetaPointer"}),
            PropertyDef({ name: "targets", type: "LionWebJsonReferenceTarget", isList: true}),
        ]
    },
    {
        name: "LionWebJsonReferenceTarget",
        properties: [
            PropertyDef({ name: "resolveInfo", type: "JSstring", mayBeNull: MAY_BE_NULL }),
            PropertyDef({ name: "reference", type: "LionWebId", mayBeNull: MAY_BE_NULL }),
        ]
    },
    /**
     * Elements without properties are assumed to be JSON/JS primitive values, and tested using `typeof`
     * and the (optional) validate function.
     */
    PrimitiveDef({ name: "LionWebId", primitiveType: "string", validate: validateId }),
    PrimitiveDef({ name: "LionWebKey", primitiveType: "string", validate: validateKey }),
    PrimitiveDef({ name: "LionWebVersion",primitiveType: "string", validate: validateVersion }),
    PrimitiveDef({ name: "LionWebSerializationFormatVersion",primitiveType: "string", validate: validateSerializationFormatVersion }),
    PrimitiveDef({ name: "JSstring", primitiveType: "string" }),
    PrimitiveDef({ name: "JSobject",primitiveType: "object" }),
])




