import {
    Syntax_ArrayContainsNull_Issue,
    Syntax_PropertyMissingIssue,
    Syntax_PropertyNullIssue,
    Syntax_PropertyTypeIssue,
    Syntax_PropertyUnknownIssue
} from "../issues/SyntaxIssues";
import { SimpleFieldValidator, ValidatorFunction } from "./SimpleFieldValidator";
import { JsonContext } from "../issues/ValidationIssue";
import { ValidationResult } from "./ValidationResult";

export type UnknownObjectType = { [key: string]: unknown };

export type PropertyType =
    "string"
    | "number"
    | "bigint"
    | "boolean"
    | "symbol"
    | "undefined"
    | "object"
    | "function"
    | "array";

export type PropertyDefinition = {
    /**
     * The property name
     */
    property: string;
    /**
     * The expected type of the property value
     */
    expectedType: PropertyType;
    /**
     * Whether the property value is allowed to be null
     */
    mayBeNull: boolean;
    /**
     * If the property type is correct, check its value further with this function.
     * Will, only be called if `this.recursive === true`.
     * If the property value is an Array, the `checkValue` will be called on each element in the array.
     * @param obj
     * @param ctx
     */
    validateValue?: ValidatorFunction;
};

// Make boolean argument more readable.
const MAY_BE_NULL = true;
const NOT_NULL = false;

/**
 * LionWebCheck can chack whether objects are LionWeb JSON objects.
 * The check can be on a single object, or recursively on an object and its children.
 */
export class LionWebSyntaxValidator {
    validationResult: ValidationResult;
    simpleFieldValidator: SimpleFieldValidator;
    /**
     * When true, each function will work recursively on the given object.
     * When false, will only check the given object.
     * Metapointers are always checked as part of the  object, disregarding the va;lue of `recursive`.
     */
    recursive: boolean = true;

    constructor(validationResult: ValidationResult) {
        this.validationResult = validationResult;
        this.simpleFieldValidator = new SimpleFieldValidator(this.validationResult);
    }

    /**
     * Check whether `obj` is a JSON object that conforms to the serialization syntax of LionCore.
     * All errors found will be pushed into the `errors` array, if its length is not 0, the check has failed.
     * @param obj
     */
    validate(obj: unknown) {
        this.validateLwChunk(obj, new JsonContext(null, ["$"]));
    }

    validateLwChunk = (obj: unknown, ctx: JsonContext): void => {
        const expected: PropertyDefinition[] = [
            { property: "serializationFormatVersion", expectedType: "string", mayBeNull: NOT_NULL, validateValue: this.simpleFieldValidator.validateSerializationFormatVersion },
            { property: "languages", expectedType: "array", mayBeNull: NOT_NULL, validateValue: this.validateLwUsedLanguage },
            { property: "nodes", expectedType: "array", mayBeNull: NOT_NULL, validateValue: this.validateLwNode },
        ];
        this.propertyChecks(obj, expected, ctx);
    }

    validateLwUsedLanguage = (obj: unknown, ctx: JsonContext): void => {
        const expected: PropertyDefinition[] = [
            { property: "key", expectedType: "string", mayBeNull: NOT_NULL, validateValue: this.simpleFieldValidator.validateKey },
            { property: "version", expectedType: "string", mayBeNull: NOT_NULL, validateValue: this.simpleFieldValidator.validateVersion }
        ];
        this.propertyChecks(obj, expected, ctx);
    }

    validateLwNode = (obj: unknown, ctx: JsonContext): void => {
        const expected: PropertyDefinition[] = [
            { property: "id", expectedType: "string", mayBeNull: NOT_NULL, validateValue: this.simpleFieldValidator.validateId },
            { property: "classifier", expectedType: "object", mayBeNull: NOT_NULL, validateValue: this.validateLwMetaPointer },
            { property: "properties", expectedType: "array", mayBeNull: NOT_NULL, validateValue: this.validateLwProperty },
            { property: "children", expectedType: "array", mayBeNull: NOT_NULL, validateValue: this.validateLwChild },
            { property: "references", expectedType: "array", mayBeNull: NOT_NULL, validateValue: this.validateLwReference },
            { property: "annotations", expectedType: "array", mayBeNull: NOT_NULL, validateValue: this.validateLwAnnotation },
            { property: "parent", expectedType: "string", mayBeNull: MAY_BE_NULL, validateValue: this.simpleFieldValidator.validateId },
        ];
        this.propertyChecks(obj, expected, ctx);
    }

    validateLwAnnotation = (obj: unknown, context: JsonContext) => {
        if (this.checkType(obj, "string", context)) {
            this.simpleFieldValidator.validateId(obj as string, context);
        }
    }

    validateLwProperty = (obj: unknown, ctx: JsonContext): void => {
        const expected: PropertyDefinition[] = [
            { property: "property", expectedType: "object", mayBeNull: NOT_NULL, validateValue: this.validateLwMetaPointer },
            { property: "value", expectedType: "string", mayBeNull: MAY_BE_NULL },
        ];
        this.propertyChecks(obj, expected, ctx);
        // TODO: hack for keys in M2 models
        // if ((obj as any)["property"].key === "IKeyed-key") {
        //     // console.log("CHECKING KEY");
        //     this.simpleFieldValidator.validateKey((obj as any)["value"], ctx);
        // }
    }

    validateLwMetaPointer = (obj: unknown, ctx: JsonContext): void => {
        const expected: PropertyDefinition[] = [
            { property: "key", expectedType: "string", mayBeNull: NOT_NULL, validateValue: this.simpleFieldValidator.validateKey },
            { property: "version", expectedType: "string", mayBeNull: MAY_BE_NULL, validateValue: this.simpleFieldValidator.validateVersion },
            { property: "language", expectedType: "string", mayBeNull: MAY_BE_NULL, validateValue: this.simpleFieldValidator.validateKey },
        ];
        this.propertyChecks(obj, expected, ctx);
    }

    validateLwChild = (obj: unknown, ctx: JsonContext): void => {
        const expected: PropertyDefinition[] = [
            { property: "containment", expectedType: "object", mayBeNull: NOT_NULL, validateValue: this.validateLwMetaPointer },
            { property: "children", expectedType: "array", mayBeNull: NOT_NULL, validateValue: this.checkChild }
        ];
        this.propertyChecks(obj, expected, ctx);
    }

    private checkChild = (obj: unknown, context: JsonContext) => {
        if (this.checkType(obj, "string", context)) {
            this.simpleFieldValidator.validateId(obj as string, context);
        }
    }

    /** Checks whether `obj` is not null or defined and has the correct type.
     */
    private checkType = (obj: unknown, expectedType: PropertyType, context: JsonContext): boolean => {
        if (obj === null || obj === undefined) {
            this.validationResult.issue(new Syntax_PropertyTypeIssue(context, "obj", expectedType, typeof obj));
            return false;
        } else if (typeof obj !== expectedType) {
            // TODO Better context: where does obj come from
            this.validationResult.issue(new Syntax_PropertyTypeIssue(context, "obj", expectedType, typeof obj));
            return false;
        }
        return true;
    }

    validateLwReference = (obj: unknown, ctx: JsonContext): void => {
        const expected: PropertyDefinition[] = [
            { property: "reference", expectedType: "object", mayBeNull: NOT_NULL, validateValue: this.validateLwMetaPointer },
            { property: "targets", expectedType: "array", mayBeNull: NOT_NULL, validateValue: this.validateLwReferenceTarget }
        ];
        this.propertyChecks(obj, expected, ctx);
    }

    validateLwReferenceTarget = (obj: unknown, ctx: JsonContext): void => {
        const expected: PropertyDefinition[] = [
            { property: "resolveInfo", expectedType: "string", mayBeNull: MAY_BE_NULL },
            { property: "reference", expectedType: "string", mayBeNull: MAY_BE_NULL, validateValue: this.simpleFieldValidator.validateId }
        ];
        this.propertyChecks(obj, expected, ctx);
    }

    /**
     * Check whether all property definitions in `propDef` are correct and check that there are
     * no iother properties in `obj`.
     * @param obj
     * @param propDefs
     * @param context
     */
    propertyChecks(obj: unknown, propDefs: PropertyDefinition[], context: JsonContext): void {
        if (!this.checkType(obj, "object", context)) {
            // console.log("UNEXPECTED NULL OBJECT");
            return;
        }
        const object = obj as UnknownObjectType;
        const allProperties: string[] = [];
        propDefs.forEach( (propDef) => {
            if (propDef.property === "key") {
                // console.log("CHECKING KEY of " + JSON.stringify(obj))
            }
            if (this.checkPropertyType(object, propDef.property, propDef.expectedType, propDef.mayBeNull, context.concat(propDef.property))) {
                const propValue = object[propDef.property];
                if (this.recursive && propDef.expectedType === "array" && Array.isArray(propValue) && !!propDef.validateValue) {
                    propValue.forEach((arrayItem: unknown, index: number) => {
                        if (arrayItem === null) {
                            this.validationResult.issue(new Syntax_ArrayContainsNull_Issue(context.concat(propDef.property, index), propDef.property, index));
                        } else {
                            if (propDef.validateValue !== null && propDef.validateValue !== undefined ) {
                                propDef.validateValue(arrayItem, context.concat(propDef.property, index));
                            } else {
                                //  TODO: give an error, whih ine?
                            }
                        }
                    });
                } else if (propDef.validateValue !== null && propDef.validateValue !== undefined) {
                    // propValue is niot an array, so it should be aa string
                    propDef.validateValue(propValue as string, context.concat(propDef.property));
                }
            }
            allProperties.push(propDef.property);
        });
        this.checkStrayProperties(object, allProperties, context);
    }

    /**
     * Check whether there are extra properties that should not be there.
     * @param obj
     * @param properties
     * @param context
     */
    checkStrayProperties(obj: UnknownObjectType, properties: string[], context: JsonContext) {
        
        const own = Object.getOwnPropertyNames(obj);
        own.forEach((ownProp) => {
            if (!properties.includes(ownProp)) {
                this.validationResult.issue(new Syntax_PropertyUnknownIssue(context, ownProp));
            }
        });
        properties.forEach((prop) => {
            if (!own.includes(prop)) {
                this.validationResult.issue(new Syntax_PropertyMissingIssue(context, prop));
            }
        });
    }

    /**
     * Check whether the value of property `prop` of `obj` has type `expectedType`.
     * @param obj
     * @param prop
     * @param expectedType
     * @param context
     */
    checkPropertyType = (obj: UnknownObjectType, prop: string, expectedType: PropertyType, mayBeNull: boolean, context: JsonContext): boolean => {
        if (prop === "key") {
            // console.log("    checking type of key " + JSON.stringify(obj));
        }
        if (obj[prop] === undefined || obj[prop] === null) {
            if (!mayBeNull) {
                this.validationResult.issue(new Syntax_PropertyNullIssue(context, prop));
                return false;
            } else {
                return true;
            }
        } else {
            const actualType = typeof obj[prop];
            if (expectedType !== actualType) {
                if (expectedType === "array" && actualType === "object") {
                    // typeof returns an object for an array, so we need to check this separately.
                    if (!Array.isArray(obj[prop])) {
                        this.validationResult.issue(new Syntax_PropertyTypeIssue(context, prop, "array", typeof obj[prop]));
                        return false;
                    } else {
                        return true;
                    }
                } else {
                    this.validationResult.issue(new Syntax_PropertyTypeIssue(context, prop, expectedType, actualType));
                    return false;
                }
            } else {
                if (expectedType === "object") {
                    // typeof returns an object for an array, so we need to check this separately.
                    if (Array.isArray(obj[prop])) {
                        this.validationResult.issue(new Syntax_PropertyTypeIssue(context, prop, expectedType, "array"));
                        return false;
                    }
                }
            }
        }
        return true;
    }
}

export function SyntaxValidator(jsonChunk:unknown): ValidationResult {
    const validationResult = new ValidationResult();
    const syntaxValidator = new LionWebSyntaxValidator(validationResult);
    syntaxValidator.validate(jsonChunk);
    return validationResult;
}
