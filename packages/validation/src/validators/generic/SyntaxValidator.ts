import {
    Syntax_ArrayContainsNull_Issue,
    Syntax_PropertyMissingIssue,
    Syntax_PropertyNullIssue,
    Syntax_PropertyTypeIssue,
    Syntax_PropertyUnknownIssue
} from "../../issues/index.js"
import { JsonContext } from "../../json/JsonContext.js"
import { ValidationResult } from "./ValidationResult.js"
import { PropertyDefinition, UnknownObjectType } from "./ValidationTypes.js"

/**
 * Syntax Validator can check whether objects are structurally conforming to the
 * definitions given in `expectedTypes`.
 */
export class SyntaxValidator {
    validationResult: ValidationResult
    expectedTypes: Map<string, PropertyDefinition[]>

    constructor(validationResult: ValidationResult, expectedTypes: Map<string, PropertyDefinition[]>) {
        this.validationResult = validationResult
        this.expectedTypes = expectedTypes
    }

    /**
     * Check whether `obj` is a JSON object that conforms to the definition of `expectedType`.
     * All errors found will be pushed into the `errors` array, if its length is not 0, the check has failed.
     * @param obj           The object to validate.
     * @param expectedType  The expected type of the object.
     */
    validate(obj: unknown, expectedType: string) {
        if (typeof obj !== "object") {
            throw new Error(`SyntaxValidator.validate: 'obj' is not an object, expected a '${expectedType}'`)
        }
        const object = obj as UnknownObjectType
        const defs = this.expectedTypes.get(expectedType)
        if (defs === undefined) {
            throw new Error(`SyntaxValidator.validate: cannot find definition for ${expectedType}`)
        } else {
            this.validateObjectProperties(expectedType, defs, object, new JsonContext(null, ["$"]))
        }
    }

    /**
     * Validate whether `object` is structured conform the properties in `propertyDef`
     * @param originalProperty  The property of which `object` it the value
     * @param propertyDef       The property definitions that are being validated
     * @param object            The object being validated
     * @param jsonContext       The location in the JSON
     * @private
     */
    private validateObjectProperties(originalProperty: string, propertyDef: PropertyDefinition[], object: UnknownObjectType, jsonContext: JsonContext) {
        if (propertyDef.length === 0) {
            return
        }
        if ((typeof object) !== "object") {
            this.validationResult.issue(new Syntax_PropertyTypeIssue(jsonContext, originalProperty, "object", typeof object))
            return
        }
        for (const pdef of propertyDef) {
            const expectedPropertyDefs = this.expectedTypes.get(pdef.expectedType)
            const validator = pdef.validate!
            const propertyValue = object[pdef.property]
            if (propertyValue === undefined) {
                this.validationResult.issue(new Syntax_PropertyMissingIssue(jsonContext, pdef.property + `{ ${typeof object}}{${originalProperty}}`))
                continue
            }
            if (!pdef.mayBeNull && propertyValue === null) {
                this.validationResult.issue(new Syntax_PropertyNullIssue(jsonContext, pdef.property))
                continue
            }
            if (pdef.mayBeNull && propertyValue === null) {
                // Ok, stop checking, continue with next property def
                continue
            }
            if (pdef.isList) {
                // Check whether value is an array
                if (!Array.isArray(propertyValue)) {
                    const newContext = jsonContext.concat(pdef.property)
                    this.validationResult.issue(new Syntax_PropertyTypeIssue(newContext, pdef.property, "array", typeof propertyValue))
                    return
                }
                // If an array, validate every item in the array
                (propertyValue as UnknownObjectType[]).forEach( (item, index) => {
                    const newContext = jsonContext.concat(pdef.property, index)
                    if (item === null) {
                        this.validationResult.issue(new Syntax_ArrayContainsNull_Issue(newContext, pdef.property,index ))
                    } else {
                        if (expectedPropertyDefs !== undefined) {
                            if (expectedPropertyDefs.length === 0) {
                                // propertyValue should be a primitive as it has no property definitions
                                if (this.validatePrimitiveValue(pdef, item, jsonContext)) {
                                    validator.apply(null, [item, this.validationResult, newContext, pdef])
                                }
                            } else {
                                // propertyValue should be an object, validate its properties
                                this.validateObjectProperties(pdef.property, expectedPropertyDefs, item as UnknownObjectType, newContext)
                                validator.apply(null, [item, this.validationResult, newContext, pdef])
                            }
                        } else {
                            throw new Error(`Expected type '${pdef.expectedType} has neither property defs, nor a validator.`)
                        }
                    }
                }) 
            } else {
                const newContext = jsonContext.concat(pdef.property)
                if (Array.isArray(propertyValue)) {
                    this.validationResult.issue(new Syntax_PropertyTypeIssue(newContext, pdef.property, pdef.expectedType, "array"))
                    return
                }
                // Single valued property, validate it
                if (expectedPropertyDefs !== undefined) {
                    if (expectedPropertyDefs.length === 0) {
                        // propertyValue should be a primitive as it has no property definitions
                        if (this.validatePrimitiveValue(pdef, propertyValue, jsonContext)) {
                            validator.apply(null, [propertyValue, this.validationResult, newContext, pdef])
                        }
                    } else {
                        // propertyValue should be an object, validate its properties
                        this.validateObjectProperties(pdef.property, expectedPropertyDefs, propertyValue as UnknownObjectType, newContext)
                        validator.apply(null, [propertyValue, this.validationResult, newContext, pdef])
                    }
                } else {
                    throw new Error(`Expected single type '${pdef.expectedType}' for '${pdef.property}'  at ${newContext.toString()} has neither property defs, nor a validator.`)
                }
            }
        }
        this.checkStrayProperties(object, propertyDef.map(pdef => pdef.property ), jsonContext)
    }
    
    validatePrimitiveValue(propDef: PropertyDefinition, object: unknown, jsonContext: JsonContext): boolean {
        if (!propDef.mayBeNull && (object === null || object === undefined)) {
            this.validationResult.issue(new Syntax_PropertyNullIssue(jsonContext, propDef.property))
            return false
        }

        if (typeof object !== propDef.expectedType) {
            this.validationResult.issue(new Syntax_PropertyTypeIssue(jsonContext, propDef.property, propDef.expectedType,typeof object))
            return false
        }
        return true
    }

    /**
     * Check whether there are extra properties that should not be there.
     * @param obj           Object to be validated
     * @param properties    The names of the expected properties
     * @param context       Location in JSON
     */
    checkStrayProperties(obj: UnknownObjectType, properties: string[], context: JsonContext) {
        const own = Object.getOwnPropertyNames(obj)
        own.forEach((ownProp) => {
            if (!properties.includes(ownProp)) {
                this.validationResult.issue(new Syntax_PropertyUnknownIssue(context, ownProp))
            }
        })
        properties.forEach((prop) => {
            if (!own.includes(prop)) {
                this.validationResult.issue(new Syntax_PropertyMissingIssue(context, prop))
            }
        })
    }
}
