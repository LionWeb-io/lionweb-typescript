import {
    Syntax_ArrayContainsNull_Issue,
    Syntax_PropertyMissingIssue,
    Syntax_PropertyNullIssue,
    Syntax_PropertyTypeIssue,
    Syntax_PropertyUnknownIssue
} from "../issues/SyntaxIssues";
import { SimpleFieldvalidator } from "./SimpleFieldvalidator";
import { IssueContext } from "../issues/ValidationIssue";
import { ValidationResult } from "./ValidationResult";

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
    validateValue?: (obj: any, ctx: string) => void;
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
    simpleFieldValidator: SimpleFieldvalidator;
    /**
     * When true, each function will work recursively on the given object.
     * When false, will only check the given object.
     * Metapointers are always checked as part of the  object, disregarding the va;lue of `recursive`.
     */
    recursive: boolean = true;

    constructor(validationResult: ValidationResult) {
        this.validationResult = validationResult;
        this.simpleFieldValidator = new SimpleFieldvalidator(this.validationResult);
    }

    /**
     * Check whether `obj` is a JSON object that conforms to the serialization syntax of LionCore.
     * All errors found will be pushed into the `errors` array, if its length is not 0, the check has failed.
     * @param obj
     */
    validate(obj: unknown) {
        this.validateLwChunk(obj);
    }

    validateLwChunk = (obj: any): void => {
        const expected: PropertyDefinition[] = [
            { property: "serializationFormatVersion", expectedType: "string", mayBeNull: NOT_NULL, validateValue: this.simpleFieldValidator.vcalidateSerializationFormatVersion },
            { property: "languages", expectedType: "array", mayBeNull: NOT_NULL, validateValue: this.validateLwUsedLanguage },
            { property: "nodes", expectedType: "array", mayBeNull: NOT_NULL, validateValue: this.validateLwNode },
        ];
        this.propertyChecks(obj, expected, "LWCHUNK");
    }

    validateLwUsedLanguage = (obj: any): void => {
        const expected: PropertyDefinition[] = [
            { property: "key", expectedType: "string", mayBeNull: NOT_NULL, validateValue: this.simpleFieldValidator.validateKey },
            { property: "version", expectedType: "string", mayBeNull: NOT_NULL, validateValue: this.simpleFieldValidator.validateVersion }
        ];
        this.propertyChecks(obj, expected, "USED_LANGUAGE ");
    }

    validateLwNode = (obj: any): void => {
        const expected: PropertyDefinition[] = [
            { property: "id", expectedType: "string", mayBeNull: NOT_NULL, validateValue: this.simpleFieldValidator.validateId },
            { property: "concept", expectedType: "object", mayBeNull: NOT_NULL, validateValue: this.validateLwMetaPointer },
            { property: "properties", expectedType: "array", mayBeNull: NOT_NULL, validateValue: this.validateLwProperty },
            { property: "children", expectedType: "array", mayBeNull: NOT_NULL, validateValue: this.validateLwChild },
            { property: "references", expectedType: "array", mayBeNull: NOT_NULL, validateValue: this.validateLwReference },
            { property: "annotations", expectedType: "array", mayBeNull: NOT_NULL, validateValue: this.validateLwAnnotation },
            { property: "parent", expectedType: "string", mayBeNull: MAY_BE_NULL, validateValue: this.simpleFieldValidator.validateId },
        ];
        this.propertyChecks(obj, expected, "Node");
    }

    validateLwAnnotation = (obj: any) => {

    }

    validateLwProperty = (obj: any): void => {
        const expected: PropertyDefinition[] = [
            { property: "property", expectedType: "object", mayBeNull: NOT_NULL, validateValue: this.validateLwMetaPointer },
            { property: "value", expectedType: "string", mayBeNull: MAY_BE_NULL },
        ];
        this.propertyChecks(obj, expected, "PROPERTY");
    }

    validateLwMetaPointer = (obj: any): void => {
        const expected: PropertyDefinition[] = [
            { property: "key", expectedType: "string", mayBeNull: NOT_NULL, validateValue: this.simpleFieldValidator.validateKey },
            { property: "version", expectedType: "string", mayBeNull: MAY_BE_NULL, validateValue: this.simpleFieldValidator.validateVersion },
            { property: "language", expectedType: "string", mayBeNull: MAY_BE_NULL, validateValue: this.simpleFieldValidator.validateKey },
        ];
        this.propertyChecks(obj, expected, "META_POINTER");
    }

    validateLwChild = (obj: any): void => {
        const expected: PropertyDefinition[] = [
            { property: "containment", expectedType: "object", mayBeNull: NOT_NULL, validateValue: this.validateLwMetaPointer },
            { property: "children", expectedType: "array", mayBeNull: NOT_NULL, validateValue: this.checkChild }
        ];
        this.propertyChecks(obj, expected, "CHILD");
    }

    private checkChild = (obj: any, context: string) => {
        if (this.checkType(obj, "string", context)) {
            this.simpleFieldValidator.validateId(obj, context);
        }
    }

    /** Checks whether `obj` is not null or defined and has the correct type.
     */
    private checkType = (obj: unknown, expectedType: PropertyType, context: string): boolean => {
        if (obj === null || obj === undefined) {
            // this.validationResult.error(`${context}: Object is ${obj}`);
            this.validationResult.issue(new Syntax_PropertyTypeIssue(new IssueContext(context), "obj", expectedType, typeof obj));
            return false;
        } else if (typeof obj !== expectedType) {
            // this.validationResult.error(`${context}: Object has type "${typeof obj}" instead of "${expectedType}"`);
            // TODO Better context: where does obj come from
            this.validationResult.issue(new Syntax_PropertyTypeIssue(new IssueContext(context), "obj", expectedType, typeof obj));
            return false;
        }
        return true;
    }

    validateLwReference = (obj: any): void => {
        const expected: PropertyDefinition[] = [
            { property: "reference", expectedType: "object", mayBeNull: NOT_NULL, validateValue: this.validateLwMetaPointer },
            { property: "targets", expectedType: "array", mayBeNull: NOT_NULL, validateValue: this.validateLwReferenceTarget }
        ];
        this.propertyChecks(obj, expected, "REFERENCE");
    }

    validateLwReferenceTarget = (obj: any): void => {
        const expected: PropertyDefinition[] = [
            { property: "resolveInfo", expectedType: "string", mayBeNull: MAY_BE_NULL },
            { property: "reference", expectedType: "string", mayBeNull: MAY_BE_NULL, validateValue: this.simpleFieldValidator.validateId }
        ];
        this.propertyChecks(obj, expected, "REFERENCE_TARGET");
    }

    /**
     * Check whether all property definitions in `propDef` are correct and check that there are
     * no iother properties in `obj`.
     * @param obj
     * @param propDefs
     * @param context
     */
    propertyChecks(obj: any, propDefs: PropertyDefinition[], context: string): void {
        if (!this.checkType(obj, "object", context)) {
            return;
        }
        const allProperties: string[] = [];
        propDefs.forEach( (propDef) => {
            if (this.checkPropertyType(obj, propDef.property, propDef.expectedType, propDef.mayBeNull, `${context}`)) {
                if (this.recursive && propDef.expectedType === "array" && Array.isArray(obj[propDef.property]) && !!propDef.validateValue) {
                    obj[propDef.property].forEach((arrayItem: any, index: number) => {
                        if (arrayItem === null) {
                            // this.validationResult.error(`${context}.${propDef.property}[${index}]: Array ${propDef.property} contains null value`);
                            this.validationResult.issue(new Syntax_ArrayContainsNull_Issue(new IssueContext(`${context}.${propDef.property}[${index}]`), propDef.property, index));
                        } else {
                            if (!!propDef.validateValue) {
                                propDef.validateValue(arrayItem, `${context}.${propDef.property}[${index}]`);
                            }
                        }
                    });
                } else if (!!propDef.validateValue) {
                    propDef.validateValue(obj[propDef.property], context);
                }
            }
            allProperties.push(propDef.property);
        });
        this.checkStrayProperties(obj, allProperties, context);
    }

    /**
     * Check whether there are extra properties that should not be there.
     * @param obj
     * @param properties
     * @param context
     */
    checkStrayProperties(obj: any, properties: string[], context: string) {
        const own = Object.getOwnPropertyNames(obj);
        own.forEach((ownProp) => {
            if (!properties.includes(ownProp)) {
                // this.validationResult.error(`${context}: Unknown extra property "${ownProp}"`);
                this.validationResult.issue(new Syntax_PropertyUnknownIssue(new IssueContext(context), ownProp));
            }
        });
        properties.forEach((prop) => {
            if (!own.includes(prop)) {
                // this.validationResult.error(`${context}: Missing property "${prop}"`);
                this.validationResult.issue(new Syntax_PropertyMissingIssue(new IssueContext(context), prop));
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
    checkPropertyType = (obj: any, prop: string, expectedType: PropertyType, mayBeNull: boolean, context: string): boolean => {
        if (obj[prop] === undefined || obj[prop] === null) {
            if (!mayBeNull) {
                // this.validationResult.error(`${context}: Property "${prop}" is null or undefined`);
                this.validationResult.issue(new Syntax_PropertyNullIssue(new IssueContext(context), prop));
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
                        // this.validationResult.error(`${context}: Type of property "${prop}" is not an array`);
                        this.validationResult.issue(new Syntax_PropertyTypeIssue(new IssueContext(context), prop, "array", typeof obj[prop]));
                        return false;
                    } else {
                        return true;
                    }
                } else {
                    // this.validationResult.error(`${context}: Property "${prop}" has type "${actualType}", should be "${expectedType}"`);
                    this.validationResult.issue(new Syntax_PropertyTypeIssue(new IssueContext(context), prop, expectedType, actualType));
                    return false;
                }
            } else {
                if (expectedType === "object") {
                    // typeof returns an object for an array, so we need to check this separately.
                    if (Array.isArray(obj[prop])) {
                        // this.validationResult.error(`${context}: Property "${prop}" has type array, should be "${expectedType}"`);
                        this.validationResult.issue(new Syntax_PropertyTypeIssue(new IssueContext(context), prop, expectedType, "array"));
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
