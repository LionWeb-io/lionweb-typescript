import { JsonContext } from "@lionweb/json-utils"
import { ValidationResult } from "../ValidationResult.js"

export type UnknownObjectType = { [key: string]: unknown }

/**
 * Definition of a property, used by the SyntaxValidator to validate objects.
 *
 * **Note** that some of the properties are defined as optional.
 * They should not be empty ever!! But being optional allows to leave them out in the `PropertyDef` function.
 * The `PropertyDef` function sets default values for all optional fields.
 * You should **always** use the `PropertyDef` function to create a `PropertyDefinition`.
 */
export type PropertyDefinition = {
    /**
     * The property name
     */
    name: string
    /**
     * The expected type of the property value
     */
    type: string
    /**
     * Whether the property value is allowed to be null
     */
    mayBeNull?: boolean
    /**
     * IS this a list property?
     */
    isList?: boolean,
    /**
     * Is this property optional?
     */
    isOptional?: boolean,
    /**
     * Additional validation function
     */
    validate?: ValidatorFunction
}

export type ValidatorFunction = <T>(obj: T, result: ValidationResult, ctx: JsonContext, pdef?: PropertyDefinition) => void
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function emptyValidation<T>(object: T, result: ValidationResult, ctx: JsonContext, pdef?: PropertyDefinition): void {}

// Make boolean argument more readable.
export const MAY_BE_NULL = true

/**
 * Definition of a primitive type.
 */
export type PrimitiveDefinition = {
    name: string,
    /**
     * The expected type of the property value
     */
    primitiveType: string
    /**
     * Additional validation function
     */
    validate?: ValidatorFunction
}

/**
 * Definition of an object type.
 */
export type ObjectDefinition = {
    name: string,
    properties: PropertyDefinition[],
    /**
     * The name of the tagged union that this type belongs to
     */
    taggedUnionType?: string
}

export type Definition = ObjectDefinition | PrimitiveDefinition
/**
 * Defionition of tagged union.
 */
export type TaggedUnionDefinition = {
    /**
     * The tagged union "super" type
     */
    unionType: string,
    /**
     * The primitive property type that is the discriminator or tag
     */
    unionDiscriminator: string,
    /**
     * The name of the property in an object that contains the discriminator value
     */
    unionProperty: string
}
/**
 * Easy way to create a PrimitiveDefinition typed object with default values.
 * @param propDef
 * @constructor
 */
export function PrimitiveDef(propDef: PrimitiveDefinition): PrimitiveDefinition {
    const { name, primitiveType, validate = emptyValidation } = propDef
    return {
        name: name,
        primitiveType: primitiveType,
        validate: validate
    }
}

/**
 * Easy way to create a PropertyDefinition typed object with default values.
 * @param propDef
 * @constructor
 */
export function PropertyDef(propDef: PropertyDefinition): PropertyDefinition {
    const { name, type, mayBeNull = false, isList = false, isOptional = false, validate = emptyValidation } = propDef
    return {
        name: name,
        type: type,
        isList: isList,
        mayBeNull: mayBeNull,
        isOptional: isOptional,
        validate: validate
    }
}

export function isObjectDefinition(def: Definition | undefined): def is ObjectDefinition {
    return  (def !== undefined) && Array.isArray((def as ObjectDefinition)?.properties)
}

export function isPrimitiveDefinition(def: Definition | undefined): def is PrimitiveDefinition {
    return (def !== undefined) && (def as PrimitiveDefinition)?.primitiveType !== undefined
}

export function isJavaScriptPrimitive(type: string): boolean {
    return ["number", "string", "boolean"].includes(type)
}
