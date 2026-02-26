import { JsonContext } from "@lionweb/json-utils"
import { ValidationResult } from "../ValidationResult.js"

export type UnknownObjectType = { [key: string]: unknown }

/**
 * Type representing a function that validates a primitive value.
 */
export type PrimitiveValidatorFunction = <T>(obj: T, result: ValidationResult, ctx: JsonContext) => void

/**
 * Represents a group of message beloning to the same group.
 * Used for representing message groups in the delta protocol.
 */
export type MessageGroup = {
    name: string;
    taggedUnionProperty: string; // messageKind 
    sharedProperties: PropertyDefinition[];
    messages: StructuredType[];
}

export type PropertyDefinition = {
    name: string;
    type: string;
    isList: boolean,
    isOptional: boolean,
    mayBeNull: boolean
}

export type StructuredType = {
    name: string;
    properties: PropertyDefinition[];
}

/**
 * Represents a group of type definitions.
 * Used for both the bulk and the delta protocol.
 */
export type TypeGroup = {
    name: string;
    primitiveTypes: PrimitiveType[];
    structuredTypes:  StructuredType[];
}

export type PrimitiveType = {
    name: string
    primitiveType: string;
}

/**
 * A `SyntaxDefinition` represents a collection of message- or type-groups that should be validated
 * as a whole.
 */
export class SyntaxDefinition {
    // Maps to make searching easier and faster
    allPrimitiveTypes: Map<string, PrimitiveType> = new Map<string, PrimitiveType>()
    allStructuredTypes: Map<string, StructuredType> = new Map<string, StructuredType>()
    allMessageGroups: Map<string, MessageGroup> = new Map<string, MessageGroup>()

    /**
     * Map from a primitive type-name to the function used to validate values of that type.
     */
    validateFunctions: Map<string, PrimitiveValidatorFunction> = new Map<string, PrimitiveValidatorFunction>()
    
    constructor(messageGroups: MessageGroup[], typeGroups: TypeGroup[]) {
        typeGroups.forEach(typeGroup => {
            typeGroup.primitiveTypes.forEach(primitiveType => {
                this.allPrimitiveTypes.set(primitiveType.name, primitiveType)
            })
            typeGroup.structuredTypes.forEach(objectType => {
                this.allStructuredTypes.set(objectType.name, objectType)
            })
        })
        messageGroups.forEach(messageGroup => {
            this.allMessageGroups.set(messageGroup.name, messageGroup)
            messageGroup.messages.forEach(msg => {
                this.allStructuredTypes.set(msg.name, msg) 
            })
        })
    }

    /**
     * Add `validate` as the function to validate values of type `primitiveTypeName`.
     * @param primitiveTypeName The type to be validated.
     * @param validate          The function performing the validation.
     */
    addValidator(primitiveTypeName: string, validate: PrimitiveValidatorFunction): void {
        this.validateFunctions.set(primitiveTypeName, validate)
    }

    getValidator(primitiveTypeName: string): PrimitiveValidatorFunction | undefined {
        return this.validateFunctions.get(primitiveTypeName)
    }

    getPrimitiveType(name: string): PrimitiveType | undefined {
        return this.allPrimitiveTypes.get(name)
    }

    getStructuredType(name: string): StructuredType | undefined {
        return this.allStructuredTypes.get(name)
    }

    getMessageGroup(name: string): MessageGroup | undefined {
        return this.allMessageGroups.get(name)
    }
}
