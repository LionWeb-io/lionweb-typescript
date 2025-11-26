import { JsonContext } from "@lionweb/json-utils"
import {
    Syntax_ArrayContainsNull_Issue,
    Syntax_PropertyMissingIssue,
    Syntax_PropertyNullIssue,
    Syntax_PropertyTypeIssue,
    Syntax_PropertyUnknownIssue
} from "../../issues/index.js"
import { SyntaxDefinition, StructuredType, PrimitiveType } from "./schema/SyntaxDefinition.js"
import { ValidationResult } from "./ValidationResult.js"
import { UnknownObjectType } from "./schema/index.js"

/**
 * Syntax Validator checks whether objects are structurally conforming to the
 * definitions given in `schema`.
 */
export class SyntaxValidator {
    validationResult: ValidationResult
    schema: SyntaxDefinition

    constructor(validationResult: ValidationResult, schema: SyntaxDefinition) {
        this.validationResult = validationResult
        this.schema = schema
    }

    /**
     * Check whether `obj` is a JSON object that conforms to the definition of `expectedType`.
     * All errors found will be added to the `validationResult` object.
     * @param obj           The object to validate.
     * @param expectedType  The expected type of the object.
     */
    validate(obj: unknown, expectedType: string) {
        const object = obj as UnknownObjectType
        const primitiveTypeDef: PrimitiveType | undefined = this.schema.getPrimitiveType(expectedType)

        if (primitiveTypeDef === undefined) {
            const objectTypeDef: StructuredType | undefined = this.schema.getStructuredType(expectedType)
            if( objectTypeDef === undefined) {
                throw new Error(`SyntaxValidator.validate: cannot find definition for '${expectedType}'`)
            } else {
                // ObjectType found
                this.validateObjectProperties(expectedType, objectTypeDef, object, new JsonContext(null, ["$"]))
            }
        } else {
            // PrimitiveType found
            this.validatePrimitiveValue("$", primitiveTypeDef, object, new JsonContext(null, ["$"]))
        }
    }

    /**
     * Validate whether `object` is structured conform the properties in `propertyDef`
     * @param originalProperty  The property of which `object` it the value
     * @param typeDef           The property definitions that are being validated
     * @param object            The object being validated
     * @param jsonContext       The location in the JSON
     * @private
     */
    validateObjectProperties(originalProperty: string, typeDef: StructuredType, object: UnknownObjectType, jsonContext: JsonContext) {
        if (typeDef === null || typeDef === undefined) {
            return
        }
        if (typeof object !== "object") {
            this.validationResult.issue(new Syntax_PropertyTypeIssue(jsonContext, originalProperty, "object", typeof object))
            return
        }
        for (const propertyDef of typeDef.properties) {
            const expectedTypeDefPrimitive = this.schema.getPrimitiveType(propertyDef.type)
            const expectedTypeDefStructured = this.schema.getStructuredType(propertyDef.type)
            const expectedMessageGroup = this.schema.getMessageGroup(propertyDef.type)
            const expectedTypeDef = expectedTypeDefPrimitive ?? expectedTypeDefStructured

            const validator = this.schema.getValidator(propertyDef.name)

            const propertyValue = object[propertyDef.name]
            if (propertyValue === undefined) {
                if (!propertyDef.isOptional) {
                    this.validationResult.issue(new Syntax_PropertyMissingIssue(jsonContext, propertyDef.name))
                }
                continue
            }
            if (!propertyDef.mayBeNull && propertyValue === null) {
                this.validationResult.issue(new Syntax_PropertyNullIssue(jsonContext, propertyDef.name))
                continue
            }
            if (propertyDef.mayBeNull && propertyValue === null) {
                // Ok, stop checking, continue with next property def
                continue
            }
            if (propertyDef.isList) {
                // Check whether value is an array
                if (!Array.isArray(propertyValue)) {
                    const newContext = jsonContext.concat(propertyDef.name)
                    this.validationResult.issue(new Syntax_PropertyTypeIssue(newContext, propertyDef.name, "array", typeof propertyValue))
                    return
                }
                // If an array, validate every item in the array
                (propertyValue as UnknownObjectType[]).forEach((item, index) => {
                    const newContext = jsonContext.concat(propertyDef.name, index)
                    if (item === null) {
                        this.validationResult.issue(new Syntax_ArrayContainsNull_Issue(newContext, propertyDef.name, index))
                    } else {
                        if (expectedTypeDef !== undefined) {
                            if (expectedTypeDef === expectedTypeDefPrimitive) {
                                if (this.validatePrimitiveValue(propertyDef.name, expectedTypeDef, item, jsonContext)) {
                                    if (validator !== undefined) {
                                        validator(item, this.validationResult, newContext)
                                    }
                                }
                            } else if (expectedTypeDef === expectedTypeDefStructured) {
                                // propertyValue should be an object, validate its properties
                                this.validateObjectProperties(propertyDef.name, expectedTypeDef, item as UnknownObjectType, newContext)
                                if (validator !== undefined) {
                                    validator(item, this.validationResult, newContext)
                                }
                            }
                        } else if (expectedMessageGroup !== undefined) {
                                console.log(`+++++++++++++++++++ ${expectedMessageGroup.name}`)
                                const messageKind = item[expectedMessageGroup.taggedUnionProperty] as string
                                    const groupTypeDef = this.schema.getStructuredType(messageKind)!
                                    this.validateObjectProperties(originalProperty, groupTypeDef, item as UnknownObjectType, newContext)
                                
                        } else {
                            throw new Error(`Expected type '${propertyDef.type} has neither property defs, nor a validator.`)
                        }
                    }
                })
            } else {
                const newContext = jsonContext.concat(propertyDef.name)
                if (Array.isArray(propertyValue)) {
                    this.validationResult.issue(new Syntax_PropertyTypeIssue(newContext, propertyDef.name, propertyDef.type, "array"))
                    return
                }
                // Single valued property, validate it
                if (expectedTypeDef !== undefined) {
                    // const primitiveType = this.schema.getPrimitiveType(expectedTypeDef.name)
                    if (expectedTypeDef === expectedTypeDefPrimitive) {
                        // propertyValue should be a primitive as it has no property definitions
                        if (this.validatePrimitiveValue(propertyDef.name, expectedTypeDef, propertyValue, jsonContext)) {
                            if (validator !== undefined) {
                                validator(propertyValue, this.validationResult, newContext)
                            }
                        }
                    } else if (expectedTypeDef === expectedTypeDefStructured) {
                        // propertyValue should be an object, validate its properties
                        this.validateObjectProperties(propertyDef.name, expectedTypeDef, propertyValue as UnknownObjectType, newContext)
                        if (validator !== undefined) {
                            validator(propertyValue, this.validationResult, newContext)
                        }
                    } else if (expectedMessageGroup !== undefined) {
                        console.log(`+++++++++++++++++++ LIST ${expectedMessageGroup.name}`)
                        const messageKind = object[expectedMessageGroup.taggedUnionProperty] as string
                        const groupTypeDef = this.schema.getStructuredType(messageKind)!
                        this.validateObjectProperties(originalProperty, groupTypeDef, propertyValue as UnknownObjectType, newContext)
                    } else {
                        throw new Error("EXPECTING ObjectDefinition or PrimitiveDefinition, but got something else")
                    }
                } else {
                    throw new Error(
                        `Op ${originalProperty}: Expected single type '${propertyDef.type}' for '${propertyDef.name}'  at ${newContext.toString()} has neither property defs, nor a validator.
                        Typedef is ${JSON.stringify(typeDef)}`
                    )
                }
            }
        }
        this.checkStrayProperties(object, typeDef, jsonContext)
    }

    validatePrimitiveValue(propertyName: string, propDef: PrimitiveType, object: unknown, jsonContext: JsonContext): boolean {
        if (typeof object !== propDef.primitiveType) {
            this.validationResult.issue(new Syntax_PropertyTypeIssue(jsonContext, propertyName, propDef.primitiveType, typeof object))
            return false
        }
        const validator = this.schema.getValidator(propDef.name)
        if (validator !== undefined) {
            validator(object, this.validationResult, jsonContext)
        }
        return true
    }

    /**
     * Check whether there are extra properties that should not be there.
     * @param obj           Object to be validated
     * @param properties    The names of the expected properties
     * @param context       Location in JSON
     */
    checkStrayProperties(obj: UnknownObjectType, def: StructuredType, context: JsonContext) {
        const own = Object.getOwnPropertyNames(obj)
        const defined = def.properties.map(pdef => pdef.name)
        own.forEach(ownProp => {
            if (!defined.includes(ownProp)) {
                this.validationResult.issue(new Syntax_PropertyUnknownIssue(context, ownProp))
            }
        })
    }
}
