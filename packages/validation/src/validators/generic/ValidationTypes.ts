import { JsonContext } from "../../json/index.js"
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
function emptyValidation<T>(object: T, result: ValidationResult, ctx: JsonContext,  pdef?: PropertyDefinition): void {}

// Make boolean argument more readable.
export const MAY_BE_NULL = true

/**
 * Easy way to create a PropertyDefinition typed object with default values.
 * @param propDef
 * @constructor
 */
export function PropertyDef(propDef: PropertyDefinition): PropertyDefinition {
    const { property, expectedType, mayBeNull = false, isList = false, validate = emptyValidation } = propDef
    return {
        property: property,
        expectedType: expectedType,
        isList: isList,
        mayBeNull: mayBeNull,
        validate: validate
    }
}

