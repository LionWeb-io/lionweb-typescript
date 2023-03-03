import {
    Concept,
    Datatype,
    Enumeration,
    Feature,
    Metamodel,
    PrimitiveType,
    Property
} from "./types.ts"
import {
    allFeaturesOf,
    isConcrete,
    isEnumeration,
    isNonDerivedContainment,
    isNonDerivedProperty,
    isNonDerivedReference
} from "./functions.ts"
import {isRef} from "../references.ts"
// TODO  import types for JSON Schema for added type-safety?


const ref = (id: string): { $ref: string } =>
    ({ $ref: `#/$defs/${id}` })


const asJSONSchemaType = (dataType: Datatype): unknown => {
    if (dataType instanceof Enumeration) {
        return ref(dataType.id)
    }
    if (dataType instanceof PrimitiveType) {
        // (TODO  use equality on the level of PrimitiveType instances (but builtins is not a singleton))
        switch (dataType.name) {
            case "String":
            case "Boolean":
            case "Integer":
            case "JSON": return { type: "string" }
            default:
                throw new Error(`can't deal with PrimitiveType "${dataType.name}"`)
        }
    }
    throw new Error(`can't handle Datatype instance: ${dataType}`)
}


const schemaForFeatures = <T extends Feature>(features: T[], mapFeature: (feature: T) => unknown, specifyRequireds: boolean) => {
    const requireds = features.filter(({optional}) => !optional)
    return {
        type: "object",
        properties: Object.fromEntries(
            features
                .map((feature) => [
                    feature.id,
                    mapFeature(feature)
                ])
        ),
        required: specifyRequireds && requireds.length > 0
            ? requireds.map(({id}) => id)
            : undefined,
        additionalProperties: false
    }
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
            concept: {
                const: concept.id
            },
            id: ref("Id"),
            properties: schemaForFeatures(allFeatures.filter(isNonDerivedProperty), schemaForProperty, true),
            children: schemaForFeatures(allFeatures.filter(isNonDerivedContainment), (_) => ref("Ids"), true),
            references: schemaForFeatures(allFeatures.filter(isNonDerivedReference), (_) => ref("Ids"), false),
            parent: ref("Id")
        },
        required: [
            "concept",
            "id",
            "properties",
            "children",
            "references"
        ],
        additionalProperties: false
    }
}

const schemaForEnumeration = ({literals}: Enumeration): unknown =>
    ({
        enum: literals.map(({name}) => name)
    })


/**
 * Generates a JSON Schema for the LIonWeb-compliant serialization JSON format
 * specific to the given metamodel.
 */
export const schemaFor = (metamodel: Metamodel): unknown /* <=> JSON Schema */ => {
    const concreteConcepts = metamodel.elements.filter(isConcrete)
    const enumerations = metamodel.elements.filter(isEnumeration)
    return {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        $id: `${metamodel.name}-serialization`,    // TODO  let caller specify URL instead?
        title: `Serialization format specific to ${metamodel.name}`,
        type: "object",
        properties: {
            serializationFormatVersion: {
                const: 1
            },
            nodes: {
                type: "array",
                items: ref("SerializedNode")
            }
        },
        required: [
            "serializationFormatVersion",
            "nodes"
        ],
        $defs: {
            // TODO (#34)  put these definitions in a separate, referred-to JSON Schema
            "Id": {
                type: "string",
                minLength: 1
            },
            "Ids": {
                type: "array",
                items: ref("Id"),
                minItems: 1 // because empties are not allowed
            },
            ...Object.fromEntries(
                concreteConcepts
                    .map((element) => [
                        element.name,
                        schemaForConcept(element)
                    ])
            ),
            "SerializedNode": {
                oneOf: concreteConcepts
                    .map(({name}) => ref(name))
            },
            ...Object.fromEntries(
                enumerations
                    .map((enumeration) => [
                        enumeration.id,
                        schemaForEnumeration(enumeration)
                    ])
            )
        }
    }
}

