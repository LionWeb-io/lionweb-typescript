import { StringsMapper } from "@lionweb/ts-utils"
import { PropertyValueDeserializer } from "../deserializer.js"
import { Concept, DataType, Interface, Language, PrimitiveType, Property } from "./types.js"
import { isUnresolvedReference } from "../references.js"
import { PropertyValueSerializer } from "../serializer.js"


/**
 * Determines whether two data types should be structurally equal based on equality of: meta type, key, and language's key.
 */
export const shouldBeIdentical = (left: DataType, right: DataType): boolean =>
    left.key === right.key && left.language.key === right.language.key && left.metaType() === right.metaType()


const lookupFrom = <T>(registry: Map<DataType, T>) =>
    (targetDataType: DataType) => {
        for (const [dataType, t] of registry.entries()) {
            if (shouldBeIdentical(targetDataType, dataType)) {
                return t
            }
        }
        return undefined
    }


/**
 * Type def. for functions that deserialize the value of a property of a specific type.
 */
export type PropertyValueDeserializerFunction = (value: string) => unknown

/**
 * @return an empty registry for populating fluently using
 * `.set(<data type>, <deserializer function>)`,
 * to pass to {@link propertyValueDeserializerFrom}.
 */
export const newPropertyValueDeserializerRegistry = () => new Map<DataType, PropertyValueDeserializerFunction>

/**
 * @return an instance of a {@link PropertyValueDeserializer} entirely driven by the passed `registry`.
 */
export const propertyValueDeserializerFrom = (registry: Map<DataType, PropertyValueDeserializerFunction>): PropertyValueDeserializer => {
    const byType = lookupFrom(registry)
    return {
        deserializeValue: (value: string | undefined, property: Property): unknown | undefined => {
            if (value === undefined) {
                if (property.optional) {
                    return undefined
                }
                throw new Error(`can't deserialize undefined as the value of required property "${property.name}" (on classifier "${property.classifier.name}" in language "${property.classifier.language.name}")`)
            }
            const { type } = property
            if (isUnresolvedReference(type)) {
                throw new Error(`can't deserialize property "${property.name}" (on classifier "${property.classifier.name}" in language "${property.classifier.language.name}") with unspecified type`)
            }
            const specificDeserializer = byType(type)
            if (specificDeserializer != undefined) {
                return specificDeserializer(value)
            } else {
                throw new Error(`can't deserialize value of property "${property.name}" (on classifier "${property.classifier.name}" in language "${property.classifier.language.name}") of type "${type!.name}": ${value}`)
            }
        }
    }
}


/**
 * Type def. for functions that serialize the value of a property of a specific type.
 */
export type PropertyValueSerializerFunction = (value: unknown) => string

/**
 * @return an empty registry for populating fluently using
 * `.set(<data type>, <serializer function>)`,
 * to pass to {@link propertyValueSerializerFrom}.
 */
export const newPropertyValueSerializerRegistry = () => new Map<DataType, PropertyValueSerializerFunction>

/**
 * @return an instance of a {@link PropertyValueSerializer} entirely driven by the passed `registry`.
 */
export const propertyValueSerializerFrom = (registry: Map<DataType, PropertyValueSerializerFunction>): PropertyValueSerializer => {
    const byType = lookupFrom(registry)
    return {
        serializeValue: (value: unknown | undefined, property: Property): string | null => {
            if (value === undefined) {
                if (property.optional) {
                    return null
                }
                throw new Error(`can't serialize undefined as the value of required property "${property.name}" (on classifier "${property.classifier.name}" in language "${property.classifier.language.name}")`)
            }
            const { type } = property
            if (isUnresolvedReference(type)) {
                throw new Error(`can't serialize property "${property.name}" (on classifier "${property.classifier.name}" in language "${property.classifier.language.name}") with unspecified type`)
            }
            const specificSerializer = byType(type)
            if (specificSerializer != undefined) {
                return specificSerializer(value)
            } else {
                throw new Error(`can't serialize value of property "${property.name}" (on classifier "${property.classifier.name}" in language "${property.classifier.language.name}") of type "${type!.name}": ${value}`)
            }
        }
    }
}


/**
 * The key of the LionCore language containing the built-ins.
 */
export const lioncoreBuiltinsKey = "LionCore-builtins"

/**
 * A function that generates IDs and keys for entities in the LionCore built-ins language.
 */
export const lioncoreBuiltinsIdAndKeyGenerator: StringsMapper = (...names) =>
    [lioncoreBuiltinsKey, ...names.slice(1)].join("-")


/**
 * Type def. for objects that façade (a version of) the LionCore built-ins.
 */
export type LionCoreBuiltinsFacade = {
    language: Language
    /** The default {@link PropertyValueDeserializer}. */
    propertyValueDeserializer: PropertyValueDeserializer
    /** The default {@link PropertyValueSerializer}. */
    propertyValueSerializer: PropertyValueSerializer
    classifiers: {
        node: Concept
        inamed: Interface
    }
    features: {
        inamed_name: Property
    }
    /**
     * The built-in primitive types: boolean, integer, string + legacy (in the `Record<...>` part).
     */
    primitiveTypes: {
        booleanDataType: PrimitiveType
        integerDataType: PrimitiveType
        stringDataType: PrimitiveType
    } & Record<string, PrimitiveType>
}

