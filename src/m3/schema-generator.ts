import {
    Concept,
    Datatype,
    Enumeration,
    Metamodel,
    PrimitiveType,
    Property
} from "./types.ts"
import {
    allFeaturesOf,
    isConcrete,
    isEnumeration,
    isRealContainment,
    isRealProperty,
    isRealReference
} from "./functions.ts"
import {isRef} from "../references.ts"
// TODO  import types for JSON Schema


const asJSONSchemaType = (dataType: Datatype): object => {
    if (dataType instanceof Enumeration) {
        return {
            $ref: `#/$defs/${dataType.simpleName}`
        }
    }
    if (dataType instanceof PrimitiveType) {
        switch (dataType.simpleName) {
            case "String": return { type: "string" }
            case "boolean": return { type: "boolean" }
            case "int": return { type: "integer" }
            case "JSON": return {}
            default:
                throw new Error(`can't deal with PrimitiveType "${dataType.simpleName}"`)
        }
    }
    throw new Error(`can't handle Datatype instance: ${dataType}`)
}

const schemaForProperty = (property: Property): unknown =>
    isRef(property.type)
        ? asJSONSchemaType(property.type)
        : {}    // "any"


const schemaForConcept = (concept: Concept): unknown => {
    const allFeatures = allFeaturesOf(concept)
    return {
        type: "object",
        properties: {
            "type": {
                const: concept.simpleName
            },
            "id": {$ref: "#/$defs/Id"},
            "properties": {
                type: "object",
                properties: Object.fromEntries(
                    allFeatures
                        .filter(isRealProperty)
                        .map((property) => [
                            property.simpleName,
                            schemaForProperty(property)
                        ])
                ),
                // TODO  required
                additionalProperties: false
            },
            "children": {
                type: "object",
                properties: Object.fromEntries(
                    allFeatures
                        .filter(isRealContainment)
                        .map(({simpleName}) => [
                            simpleName,
                            { $ref: "#/$defs/Ids" }
                        ])
                ),
                // TODO  required (also with minLength=1 in property-def.)
                additionalProperties: false
            },
            "references": {
                type: "object",
                properties: Object.fromEntries(
                    allFeatures
                        .filter(isRealReference)
                        .map(({simpleName}) => [
                            simpleName,
                            { $ref: "#/$defs/SerializedRefs" }
                        ])
                ),
                // TODO  required (also with minLength=1 in property-def.)
                additionalProperties: false
            }
        },
        required: [
            "type", "id"
        ],
        additionalProperties: false
    }
}

export const schemaFor = (metamodel: Metamodel): unknown => {
    const concreteConcepts = metamodel.elements.filter(isConcrete)
    const enumerations = metamodel.elements.filter(isEnumeration)
    return {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        $id: `${metamodel.qualifiedName}-serialization`,    // TODO  let caller specify URL instead?
        title: `Serialization format specific to ${metamodel.qualifiedName}`,
        type: "array",
        items: {
            $ref: "#/$defs/SerializedNode"
        },
        $defs: {
            "Id": {
                type: "string",
                minLength: 1
            },
            "Ids": {
                type: "array",
                items: {
                    $ref: "#/$defs/Id"
                }
            },
            "SerializedRefs": {
                type: "array",
                items: {
                    oneOf: [
                        { type: "string" },
                        { type: "null" }    // could also be: { const: null }
                    ]
                }
            },
            ...Object.fromEntries(
                concreteConcepts
                    .map((element) => [
                        element.simpleName,
                        schemaForConcept(element)
                    ])
            ),
            "SerializedNode": {
                oneOf: concreteConcepts
                    .map(({simpleName}) => ({ $ref: `#/$defs/${simpleName}` }))
            },
            ...Object.fromEntries(
                enumerations
                    .map((enumeration) => [
                        enumeration.simpleName,
                        {
                            enum: enumeration.literals.map(({simpleName}) => simpleName)
                        }
                    ])
            )
        }
    }
}

