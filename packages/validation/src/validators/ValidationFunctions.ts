/**
 * A list of functions that are used to validate primitive fields for LionWeb conformance.
 * Used in the LionWebSyntaxValidator.
 */
import { JsonContext } from "@lionweb/json-utils"
import { Language_PropertyValue_Issue } from "../issues/LanguageIssues.js"
import {
    Syntax_IdFormat_Issue,
    Syntax_KeyFormat_Issue,
    Syntax_PropertyNullIssue,
    Syntax_SerializationFormatVersion_Issue,
    Syntax_VersionFormat_Issue
} from "../issues/SyntaxIssues.js"
import { ValidationResult } from "./generic/ValidationResult.js"
import { PropertyDefinition } from "./generic/ValidationTypes.js"

/**
 * Check whether `id` is a valid LionWeb id.
 * @param value     The `value` to be checked.
 * @param result    Any validation issues found will be put into this object.
 * @param context   The context for the error message in errors.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function validateId<String>(value: String, result: ValidationResult, context: JsonContext): void {
    const idString: string = "" + value
    const regexp = /^[a-zA-Z0-9$_-][a-zA-Z0-9$_-]*$/
    if (!regexp.test(idString)) {
        result.issue(new Syntax_IdFormat_Issue(context, idString))
    }
}

/**
 * Check whether `key` is a valid LionWeb key.
 * @param value     The `key` to be checked.
 * @param result    Any validation issues found will be put into this object.
 * @param context   The context for the error message in errors.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function validateKey<String>(value: String, result: ValidationResult, context: JsonContext): void {
    const keyString: string = "" + value
    const regexp = /^[a-zA-Z0-9_-][a-zA-Z0-9_-]*$/
    if (!regexp.test(keyString)) {
        result.issue(new Syntax_KeyFormat_Issue(context, keyString))
    }
}

/**
 * Check whether `version` is a valid LionWeb version.
 * @param value     The version to be checked
 * @param result    Any validation issues found will be put into this object.
 * @param context   The location in the overall JSON.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function validateVersion<String>(value: String, result: ValidationResult, context: JsonContext): void {
    const versionString: string = "" + value
    if (versionString.length === 0) {
        result.issue(new Syntax_VersionFormat_Issue(context, versionString))
    }
}

/**
 * Check whether the string `value` represents a LionWeb boolean, its value should be "true" or "false".
 * @param value     The value to be checked
 * @param result    Any validation issues found will be put into this object.
 * @param context   The location in the overall JSON.
 * @param propDef   The PropertyDefinition for this value
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function validateBoolean<String>(value: String, result: ValidationResult, context: JsonContext, propDef?: PropertyDefinition): void {
    const valueAsPrimitive = "" + value
    if (valueAsPrimitive !== "true" && valueAsPrimitive !== "false") {
        result.issue(new Language_PropertyValue_Issue(context, (propDef ? propDef.property : "unknown"), valueAsPrimitive, "boolean " + JSON.stringify(value)))
    }
}

/**
 * Check whether the string `value` represents a LionWeb integer
 * @param value     The value to be checked
 * @param result    Any validation issues found will be put into this object.
 * @param context   The location in the overall JSON.
 * @param propDef   The PropertyDefinition for this value
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function validateInteger<String>(value: String, result: ValidationResult, context: JsonContext, propDef?: PropertyDefinition): void {
    const valueAsPrimitive = "" + value
    const regexp = /^[+-]?(0|[1-9][0-9]*)$/
    if (valueAsPrimitive === null || !regexp.test(valueAsPrimitive)) {
        result.issue(new Language_PropertyValue_Issue(context, (propDef ? propDef.property : "unknown"), valueAsPrimitive, "integer"))
    }
}

/**
 * Check whether the string `value` represents a LionWeb Json.
 * @param value     The value to be checked
 * @param result    Any validation issues found will be put into this object.
 * @param context   The location in the overall JSON.
 * @param propDef   The PropertyDefinition for this value
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function validateJSON<String>(value: String, result: ValidationResult, context: JsonContext, propDef?: PropertyDefinition): void {
    const valueAsPrimitive = "" + value
    if (value === null) {
        result.issue(new Syntax_PropertyNullIssue(context, propDef!.property!))
    }
    try {
        JSON.parse(valueAsPrimitive)
    } catch (e) {
        result.issue(new Language_PropertyValue_Issue(context, (propDef ? propDef.property : "unknown"), valueAsPrimitive, "JSON"))
    }
}

/**
 * Check whether the string `value` is a correct LionWeb serializationFormatVersion.
 * @param value
 * @param result
 * @param context
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function validateSerializationFormatVersion<String>(value: String, result: ValidationResult, context: JsonContext): void {
    if (typeof value !== "string") {
        result.issue(new Syntax_SerializationFormatVersion_Issue(context, JSON.stringify(value)))
        return
    }
    if (value.length === 0) {
        result.issue(new Syntax_SerializationFormatVersion_Issue(context, value))
        return
    }
}
