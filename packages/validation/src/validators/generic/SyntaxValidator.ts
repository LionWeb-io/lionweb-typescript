import { JsonContext } from "@lionweb/json-utils"
import {
    Syntax_ArrayContainsNull_Issue,
    Syntax_PropertyMissingIssue,
    Syntax_PropertyNullIssue,
    Syntax_PropertyTypeIssue,
    Syntax_PropertyUnknownIssue
} from "../../issues/index.js"
import { ValidationResult } from "./ValidationResult.js"
import {
    isObjectDefinition,
    isPrimitiveDefinition,
    ObjectDefinition,
    PrimitiveDefinition,
    TypeDefinition,
    UnknownObjectType
} from "./ValidationTypes.js"

/**
 * Syntax Validator can check whether objects are structurally conforming to the
 * definitions given in `typeDefinitions`.
 */
export class SyntaxValidator {
    validationResult: ValidationResult
    typeDefinitions: Map<string, TypeDefinition>

    constructor(validationResult: ValidationResult, expectedTypes: Map<string, TypeDefinition>) {
        this.validationResult = validationResult
        this.typeDefinitions = expectedTypes
    }

    /**
     * Check whether `obj` is a JSON object that conforms to the definition of `expectedType`.
     * All errors found will be pushed into the `errors` array, if its length is not 0, the check has failed.
     * @param obj           The object to validate.
     * @param expectedType  The expected type of the object.
     */
    validate(obj: unknown, expectedType: string) {
        const object = obj as UnknownObjectType
        const typeDef = this.typeDefinitions.get(expectedType)
        if (typeDef === undefined) {
            throw new Error(`SyntaxValidator.validate: cannot find definition for ${expectedType}`)
        } else if (isObjectDefinition(typeDef)){
            this.validateObjectProperties(expectedType, typeDef, object, new JsonContext(null, ["$"]))
        } else if( isPrimitiveDefinition(typeDef)) {
            this.validatePrimitiveValue("$", typeDef, object, new JsonContext(null, ["$"]))
        }
    }

    /**
     * Validate whether `object` is structured conform the properties in `propertyDef`
     * @param originalProperty  The property of which `object` it the value
     * @param typeDef       The property definitions that are being validated
     * @param object            The object being validated
     * @param jsonContext       The location in the JSON
     * @private
     */
    validateObjectProperties(originalProperty: string, typeDef: ObjectDefinition, object: UnknownObjectType, jsonContext: JsonContext) {
        if (typeDef === null || typeDef === undefined) {
            return
        }
            if ((typeof object) !== "object") {
                this.validationResult.issue(new Syntax_PropertyTypeIssue(jsonContext, originalProperty, "object", typeof object))
                return
            }
            for (const propertyDef of typeDef) {
                const expectedTypeDef = this.typeDefinitions.get(propertyDef.expectedType)
                const validator = propertyDef.validate!
                const propertyValue = object[propertyDef.property]
                if (propertyValue === undefined) {
                    if (!propertyDef.isOptional) {
                        this.validationResult.issue(new Syntax_PropertyMissingIssue(jsonContext, propertyDef.property))
                    }
                    continue
                }
                if (!propertyDef.mayBeNull && propertyValue === null) {
                    this.validationResult.issue(new Syntax_PropertyNullIssue(jsonContext, propertyDef.property))
                    continue
                }
                if (propertyDef.mayBeNull && propertyValue === null) {
                    // Ok, stop checking, continue with next property def
                    continue
                }
                if (propertyDef.isList) {
                    // Check whether value is an array
                    if (!Array.isArray(propertyValue)) {
                        const newContext = jsonContext.concat(propertyDef.property)
                        this.validationResult.issue(new Syntax_PropertyTypeIssue(newContext, propertyDef.property, "array", typeof propertyValue))
                        return
                    }
                    // If an array, validate every item in the array
                    (propertyValue as UnknownObjectType[]).forEach((item, index) => {
                        const newContext = jsonContext.concat(propertyDef.property, index)
                        if (item === null) {
                            this.validationResult.issue(new Syntax_ArrayContainsNull_Issue(newContext, propertyDef.property, index))
                        } else {
                            if (expectedTypeDef !== undefined) {
                                if (isPrimitiveDefinition(expectedTypeDef)) {
                                    // propertyValue should be a primitive as it has no property definitions
                                    if (this.validatePrimitiveValue(propertyDef.property, expectedTypeDef, item, jsonContext)) {
                                        validator.apply(null, [item, this.validationResult, newContext, propertyDef])
                                    }
                                } else {
                                    // propertyValue should be an object, validate its properties
                                    this.validateObjectProperties(propertyDef.property, expectedTypeDef, item as UnknownObjectType, newContext)
                                    validator.apply(null, [item, this.validationResult, newContext, propertyDef])
                                }
                            } else {
                                throw new Error(`Expected type '${propertyDef.expectedType} has neither property defs, nor a validator.`)
                            }
                        }
                    })
                } else {
                    const newContext = jsonContext.concat(propertyDef.property)
                    if (Array.isArray(propertyValue)) {
                        this.validationResult.issue(new Syntax_PropertyTypeIssue(newContext, propertyDef.property, propertyDef.expectedType, "array"))
                        return
                    }
                    // Single valued property, validate it
                    if (expectedTypeDef !== undefined) {
                        if (isPrimitiveDefinition(expectedTypeDef)) {
                            // propertyValue should be a primitive as it has no property definitions
                            if (this.validatePrimitiveValue(propertyDef.property, expectedTypeDef, propertyValue, jsonContext)) {
                                validator.apply(null, [propertyValue, this.validationResult, newContext, propertyDef])
                            }
                        } else if (isObjectDefinition(expectedTypeDef)) {
                            // propertyValue should be an object, validate its properties
                            this.validateObjectProperties(propertyDef.property, expectedTypeDef, propertyValue as UnknownObjectType, newContext)
                            validator.apply(null, [propertyValue, this.validationResult, newContext, propertyDef])
                        } else {
                            throw new Error("EXPECTING ObjectDefinition or PrimitiveDefinition, but got something else")
                        }
                    } else {
                        throw new Error(`Expected single type '${propertyDef.expectedType}' for '${propertyDef.property}'  at ${newContext.toString()} has neither property defs, nor a validator.`)
                    }
                }
            }
            this.checkStrayProperties(object, typeDef, jsonContext)
    }
    
    validatePrimitiveValue(propertyName: string, propDef: PrimitiveDefinition, object: unknown, jsonContext: JsonContext): boolean {
        // if (!propDef.mayBeNull && (object === null || object === undefined)) {
        //     this.validationResult.issue(new Syntax_PropertyNullIssue(jsonContext, propDef.property))
        //     return false
        // }

        if (typeof object !== propDef.primitiveType) {
            this.validationResult.issue(new Syntax_PropertyTypeIssue(jsonContext, propertyName, propDef.primitiveType,typeof object))
            return false
        }
        propDef.validate!(object, this.validationResult, jsonContext)
        return true
    }

    /**
     * Check whether there are extra properties that should not be there.
     * @param obj           Object to be validated
     * @param properties    The names of the expected properties
     * @param context       Location in JSON
     */
    checkStrayProperties(obj: UnknownObjectType, def: ObjectDefinition, context: JsonContext) {
        const own = Object.getOwnPropertyNames(obj)
        const defined = def.map(pdef => pdef.property)
        own.forEach((ownProp) => {
            if (!defined.includes(ownProp)) {
                this.validationResult.issue(new Syntax_PropertyUnknownIssue(context, ownProp))
            }
        })
    }
}
