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
    isPrimitiveDefinition, ObjectDefinition, PrimitiveDefinition, DefinitionSchema,
    UnknownObjectType
} from "./schema/index.js"

/**
 * Syntax Validator checks whether objects are structurally conforming to the
 * definitions given in `schema`.
 */
export class SyntaxValidator {
    validationResult: ValidationResult
    schema: DefinitionSchema

    constructor(validationResult: ValidationResult, schema: DefinitionSchema) {
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
        const typeDef = this.schema.getDefinition(expectedType)

        if (typeDef === undefined) {
            throw new Error(`SyntaxValidator.validate: cannot find definition for ${expectedType}`)
        } else if (isObjectDefinition(typeDef)) {
            this.validateObjectProperties(expectedType, typeDef, object, new JsonContext(null, ["$"]))
        } else if (isPrimitiveDefinition(typeDef)) {
            this.validatePrimitiveValue("$", typeDef, object, new JsonContext(null, ["$"]))
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
    validateObjectProperties(originalProperty: string, typeDef: ObjectDefinition, object: UnknownObjectType, jsonContext: JsonContext) {
        if (typeDef === null || typeDef === undefined) {
            return
        }
        if (typeof object !== "object") {
            this.validationResult.issue(new Syntax_PropertyTypeIssue(jsonContext, originalProperty, "object", typeof object))
            return
        }
        for (const propertyDef of typeDef.properties) {
            // const taggedUnion = this.schema.getTaggedUnionDefinition(propertyDef.type)
            // if (taggedUnion !== undefined) {
            //     this.validateTaggedUnion(propertyDef, typeDef, object, jsonContext.concat(propertyDef.name))
            //     continue
            // }
            const expectedTypeDef = this.schema.getDefinition(propertyDef.type)
            const validator = propertyDef.validate!
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
                            if (isPrimitiveDefinition(expectedTypeDef)) {
                                if (this.validatePrimitiveValue(propertyDef.name, expectedTypeDef, item, jsonContext)) {
                                    validator.apply(null, [item, this.validationResult, newContext, propertyDef])
                                }
                            } else {
                                // propertyValue should be an object, validate its properties
                                this.validateObjectProperties(propertyDef.name, expectedTypeDef, item as UnknownObjectType, newContext)
                                validator.apply(null, [item, this.validationResult, newContext, propertyDef])
                            }
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
                    if (isPrimitiveDefinition(expectedTypeDef)) {
                        // propertyValue should be a primitive as it has no property definitions
                        if (this.validatePrimitiveValue(propertyDef.name, expectedTypeDef, propertyValue, jsonContext)) {
                            validator.apply(null, [propertyValue, this.validationResult, newContext, propertyDef])
                        }
                    } else if (isObjectDefinition(expectedTypeDef)) {
                        // propertyValue should be an object, validate its properties
                        this.validateObjectProperties(propertyDef.name, expectedTypeDef, propertyValue as UnknownObjectType, newContext)
                        validator.apply(null, [propertyValue, this.validationResult, newContext, propertyDef])
                    } else {
                        throw new Error("EXPECTING ObjectDefinition or PrimitiveDefinition, but got something else")
                    }
                } else {
                    throw new Error(
                        `Expected single type '${propertyDef.type}' for '${propertyDef.name}'  at ${newContext.toString()} has neither property defs, nor a validator.`
                    )
                }
            }
        }
        this.checkStrayProperties(object, typeDef, jsonContext)
    }

    validatePrimitiveValue(propertyName: string, propDef: PrimitiveDefinition, object: unknown, jsonContext: JsonContext): boolean {
        if (typeof object !== propDef.primitiveType) {
            this.validationResult.issue(new Syntax_PropertyTypeIssue(jsonContext, propertyName, propDef.primitiveType, typeof object))
            return false
        }
        propDef.validate!(object, this.validationResult, jsonContext)
        return true
    }

    /**
     *
     * @param propertyDef the definition of the property that has the TaggedUnionType as its type
     * @param typeDef The object definition containing the `propertyDef`
     * @param object The object of type `typeDef` that should have the property described by `propertyDef`
     * @param jsonContext
     */
    // validateTaggedUnion(
    //     propertyDef: PropertyDefinition,
    //     typeDef: ObjectDefinition,
    //     object: UnknownObjectType,
    //     jsonContext: JsonContext
    // ): void {
    //     // console.log(`validateTaggedUnion ${JSON.stringify(propertyDef)}, typedef ${typeDef.name}  object: ${JSON.stringify(object, null, 3)}`)
    //     const taggedObject = object[propertyDef.name]
    //     if (propertyDef.isList) {
    //         if (!Array.isArray(taggedObject)) {
    //             this.validationResult.issue(new GenericIssue(jsonContext, `Property value '${propertyDef.name}' expects an array, found '${typeof taggedObject}'`))
    //         } else {
    //             taggedObject.forEach((taggedObjectSingle, index) => {
    //                 this.validateTaggedObject(taggedObjectSingle, jsonContext.concat(index))
    //             })
    //         }
    //     } else {
    //         if (!(typeof taggedObject === "object")) {
    //             this.validationResult.issue(new GenericIssue(jsonContext, `Property value '${propertyDef.name}' expects an object, found '${typeof taggedObject}'`))
    //         } else {
    //             this.validateTaggedObject(taggedObject as UnknownObjectType, jsonContext)
    //         }
    //     }
    // }

    /**
     * Validate a single tagged object
     * @param taggedObject
     * @param jsonContext
     */
    // validateTaggedObject(taggedObject: UnknownObjectType, jsonContext: JsonContext): void {
    //     const actualTypeName = taggedObject["messageKind"] as string
    //     const actualType = this.schema.getDefinition(actualTypeName)
    //     if (actualType === undefined || !isObjectDefinition(actualType)) {
    //         this.validationResult.issue(new GenericIssue(jsonContext, `Expected object type is ${typeof taggedObject}, should be object`))
    //     } else {
    //         this.validateObjectProperties(actualTypeName, actualType, taggedObject, jsonContext)
    //     }
    // }

    /**
     * Check whether there are extra properties that should not be there.
     * @param obj           Object to be validated
     * @param properties    The names of the expected properties
     * @param context       Location in JSON
     */
    checkStrayProperties(obj: UnknownObjectType, def: ObjectDefinition, context: JsonContext) {
        const own = Object.getOwnPropertyNames(obj)
        const defined = def.properties.map(pdef => pdef.name)
        own.forEach(ownProp => {
            if (!defined.includes(ownProp)) {
                this.validationResult.issue(new Syntax_PropertyUnknownIssue(context, ownProp))
            }
        })
    }
}
