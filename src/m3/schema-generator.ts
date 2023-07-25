import {
    Concept,
    Datatype,
    Enumeration,
    Feature,
    Language,
    PrimitiveType,
    Property
} from "./types.ts"
import {
    allFeaturesOf,
    isConcrete,
    isContainment,
    isEnumeration,
    isProperty,
    isReference
} from "./functions.ts"
import {isRef} from "../references.ts"
// TODO  import types for JSON Schema for added type-safety?


const ref = (id: string): { $ref: string } =>
    ({ $ref: `#/$defs/${id}` })

const isString = () => ({ type: "string" })

const asJSONSchemaType = (dataType: Datatype): unknown => {
    if (dataType instanceof Enumeration) {
        return ref(dataType.key)
    }
    if (dataType instanceof PrimitiveType) {
        // (TODO  use equality on the level of PrimitiveType instances (but builtins is not a singleton))
        switch (dataType.name) {
            case "String":
            case "Boolean":
            case "Integer":
            case "JSON": return isString()
            default:
                throw new Error(`can't deal with PrimitiveType "${dataType.name}"`)
        }
    }
    throw new Error(`can't handle Datatype instance: ${dataType}`)
}


const schemaForFeatures = <T extends Feature>(features: T[], mapFeature: (feature: T) => unknown, specifyRequireds: boolean) => {
    const requireds = features.filter(({optional}) => !optional)
    return {
        type: "array",
        items: {
            // FIXME  what here?
        },
        properties: Object.fromEntries(
            features
                .map((feature) => [
                    feature.key,
                    mapFeature(feature)
                ])
        ),
        required: specifyRequireds && requireds.length > 0
            ? requireds.map(({key}) => key)
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
            id: ref("Id"),
            concept: {
                const: {
                    metamodel: "LIonCore_M3",
                    version: "1",
                    key: concept.key
                }
            },
            properties: schemaForFeatures(allFeatures.filter(isProperty), schemaForProperty, true),
            children: schemaForFeatures(allFeatures.filter(isContainment), (_) => ref("Ids"), true),
            references: schemaForFeatures(allFeatures.filter(isReference), (_) => ref("Ids"), false),
            parent: ref("Id")
        },
        required: [
            "id",
            "concept",
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
 * specific to the (metamodel in/of the) given language.
 */
export const schemaFor = (language: Language): unknown /* <=> JSON Schema */ => {
    const concreteConcepts = language.elements.filter(isConcrete)
    const enumerations = language.elements.filter(isEnumeration)
    return {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        $id: `${language.name}-serialization`,    // TODO  let caller specify URL instead?
        title: `Serialization format specific to ${language.name}`,
        ...ref("SerializedModel"),
        $defs: {
            // TODO (#34)  put the static definitions in a separate, referred-to JSON Schema
            "SerializedModel": {
                type: "object",
                properties: {
                    serializationFormatVersion: {
                        const: "1"
                    },
                    languages: {
                        const: []
                    },
                    nodes: {
                        type: "array",
                        items: ref("SerializedNode")
                    }
                },
                required: [
                    "serializationFormatVersion",
                    "languages",
                    "nodes"
                ],
                additionalProperties: false
            },
            "Id": {
                type: "string",
                minLength: 1
            },
            "Ids": {
                type: "array",
                items: ref("Id"),
                minItems: 1 // because empties are not allowed
            },
            "MetaPointer": {
                type: "object",
                properties: {
                    "language": isString(),
                    "version": isString(),
                    "key": isString()
                },
                required: [
                    "language",
                    "version",
                    "key"
                ],
                additionalProperties: false
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
                        enumeration.key,
                        schemaForEnumeration(enumeration)
                    ])
            )
        }
    }
}

