import { JsonContext } from "@lionweb/json-utils"
import { ValidationResult } from "../ValidationResult.js"

export type UnknownObjectType = { [key: string]: unknown }

export type PrimitiveValidatorFunction = <T>(obj: T, result: ValidationResult, ctx: JsonContext) => void

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

export type TypeGroup = {
    name: string;
    primitiveTypes: PrimitiveType[];
    structuredTypes:  StructuredType[];

}
export type PrimitiveType = {
    name: string
    primitiveType: string;
}

export class SyntaxDefinition {
    // Maps to make searching easier and faster
    allPrimitiveTypes: Map<string, PrimitiveType> = new Map<string, PrimitiveType>()
    allStructuredTypes: Map<string, StructuredType> = new Map<string, StructuredType>()
    allMessageGroups: Map<string, MessageGroup> = new Map<string, MessageGroup>()

    validateFunctions: Map<string, PrimitiveValidatorFunction> = new Map<string, PrimitiveValidatorFunction>()
    
    constructor(messageGroups: MessageGroup[], types: TypeGroup[]) {
        types.forEach(type => {
            type.primitiveTypes.forEach(primitiveType => {
                this.allPrimitiveTypes.set(primitiveType.name, primitiveType)
            })
            type.structuredTypes.forEach(objectType => {
                this.allStructuredTypes.set(objectType.name, objectType)
            })
        })
        messageGroups.forEach(msgGroup => {
            this.allMessageGroups.set(msgGroup.name, msgGroup)
            msgGroup.messages.forEach(msg => {
                this.allStructuredTypes.set(msg.name, msg) 
            })
        })
    }

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
