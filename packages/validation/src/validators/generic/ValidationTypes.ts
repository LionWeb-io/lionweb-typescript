import { JsonContext } from "@lionweb/json-utils"
import { ValidationResult } from "./ValidationResult.js"

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
    property: string
    /**
     * The expected type of the property value
     */
    expectedType: string
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

/**
 * Default for the `validation` property, does nothing.
 * @param object
 * @param result
 * @param ctx
 * @param pdef
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function emptyValidation<T>(object: T, result: ValidationResult, ctx: JsonContext, pdef?: PropertyDefinition): void {}

// Make boolean argument more readable.
export const MAY_BE_NULL = true

/**
 * Easy way to create a PropertyDefinition typed object with default values.
 * @param propDef
 * @constructor
 */
export function PropertyDef(propDef: PropertyDefinition): PropertyDefinition {
    const { property, expectedType, mayBeNull = false, isList = false, isOptional = false, validate = emptyValidation } = propDef
    return {
        property: property,
        expectedType: expectedType,
        isList: isList,
        mayBeNull: mayBeNull,
        isOptional: isOptional,
        validate: validate
    }
}

export type PrimitiveDefinition = {
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
 * Easy way to create a PropertyDefinition typed object with default values.
 * @param propDef
 * @constructor
 */
export function PrimitiveDef(propDef: PrimitiveDefinition): PrimitiveDefinition {
    const { primitiveType, validate = emptyValidation } = propDef
    return {
        primitiveType: primitiveType,
        validate: validate
    }
}
export type ObjectDefinition = PropertyDefinition[]
export type TypeDefinition = ObjectDefinition | PrimitiveDefinition

export function isObjectDefinition(def: TypeDefinition): def is ObjectDefinition {
    return Array.isArray(def)
}

export function isPrimitiveDefinition(def: TypeDefinition): def is PrimitiveDefinition {
    return (def as PrimitiveDefinition)?.primitiveType !== undefined
}
