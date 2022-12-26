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
    isRealContainment,
    isRealProperty,
    isRealReference
} from "./functions.ts"
import {isRef} from "../references.ts"
// TODO  import types for JSON Schema


const ref = (id: string): { $ref: string } =>
    ({ $ref: `#/$defs/${id}` })


const asJSONSchemaType = (dataType: Datatype): unknown => {
    if (dataType instanceof Enumeration) {
        return ref(dataType.id)
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


const schemaForProperties = <T extends Feature>(features: T[], mapFeature: (feature: T) => unknown, specifyRequireds: boolean) => {
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

const schemaForConcept = (concept: Concept): unknown => {
    const allFeatures = allFeaturesOf(concept)
    return {
        type: "object",
        properties: {
            "type": {
                const: concept.id
            },
            "id": ref("Id"),
            "properties": schemaForProperties(allFeatures.filter(isRealProperty), schemaForProperty, true),
            "children": schemaForProperties(allFeatures.filter(isRealContainment), () => ref("Ids"), true),
                // TODO  required (also with minLength=1 in property-def.)
            "references": schemaForProperties(allFeatures.filter(isRealReference), () => ref("SerializedRefs"), false),
                // TODO  required (also with minLength=1 in property-def.)
        },
        required: [
            "type", "id"
        ],
        additionalProperties: false
    }
}

const schemaForEnumeration = ({literals}: Enumeration): unknown =>
    ({
        enum: literals.map(({simpleName}) => simpleName)
    })


export const schemaFor = (metamodel: Metamodel): unknown => {
    const concreteConcepts = metamodel.elements.filter(isConcrete)
    const enumerations = metamodel.elements.filter(isEnumeration)
    return {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        $id: `${metamodel.qualifiedName}-serialization`,    // TODO  let caller specify URL instead?
        title: `Serialization format specific to ${metamodel.qualifiedName}`,
        type: "array",
        items: ref("SerializedNode"),
        $defs: {
            // TODO  consider putting these definitions in a separate, referred-to JSON Schema
            "Id": {
                type: "string",
                minLength: 1
            },
            "Ids": {
                type: "array",
                items: ref("Id")
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
                    .map(({simpleName}) => ref(simpleName))
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

