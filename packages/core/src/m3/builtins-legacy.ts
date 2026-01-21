import { asMinimalJsonString } from "@lionweb/ts-utils"
import { builtinPrimitives } from "./builtins.js"
import { shouldBeIdentical } from "./builtins-common.js"
import { PropertyValueDeserializer } from "../deserializer.js"
import { DataType, Property } from "./types.js"
import { isUnresolvedReference } from "../references.js"
import { PropertyValueSerializer } from "../serializer.js"


abstract class DataTypeRegistry<T> {
    private map = new Map<DataType, T>()

    private _sealed = false

    sealed() {
        this._sealed = true
        return this
    }

    public register(dataType: DataType, t: T) {
        if (this._sealed) {
            throw new Error(`can't register a data type with a register that has been sealed`)
        }
        this.map.set(dataType, t)
    }

    protected byType(targetDataType: DataType): T | undefined {
        for (const [dataType, t] of this.map.entries()) {
            if (shouldBeIdentical(targetDataType, dataType)) {
                return t
            }
        }
        return undefined
    }
}


const { booleanDataType, integerDataType, jsonDataType, stringDataType } = builtinPrimitives


/**
 * An implementation of {@link PropertyValueDeserializer} that knows how to deserialize serialized values of all the built-in primitive types.
 *
 * @deprecated
 */
export class BuiltinPropertyValueDeserializer
    extends DataTypeRegistry<(value: string) => unknown>
    implements PropertyValueDeserializer {
    constructor() {
        super()
        this.register(stringDataType, (value) => value)
        this.register(booleanDataType, (value) => JSON.parse(value))
        this.register(integerDataType, (value) => Number(value))
        this.register(jsonDataType, (value) => JSON.parse(value as string))
    }

    deserializeValue(value: string | undefined, property: Property): unknown | undefined {
        if (value === undefined) {
            if (property.optional) {
                return undefined
            }
            throw new Error(`can't deserialize undefined as the value of required property "${property.name}" (on classifier "${property.classifier.name}" in language "${property.classifier.language.name}")`)
        }
        const { type } = property
        if (isUnresolvedReference(type)) {
            throw new Error(`can't deserialize property "${property.name}" (on classifier "${property.classifier.name}" in language "${property.classifier.language.name}") with unspecified type`)
        }
        const specificDeserializer = this.byType(type)
        if (specificDeserializer != undefined) {
            return specificDeserializer(value)
        } else {
            throw new Error(`can't deserialize value of property "${property.name}" (on classifier "${property.classifier.name}" in language "${property.classifier.language.name}") of type "${type!.name}": ${value}`)
        }
    }
}

/**
 * Misspelled alias of {@link BuiltinPropertyValueDeserializer}, kept for backward compatibility, and to be deprecated and removed later.
 *
 * @deprecated
 */
export class DefaultPrimitiveTypeDeserializer extends BuiltinPropertyValueDeserializer {
}

/**
 * An implementation of {@link PropertyValueSerializer} that knows how to serialize values of all the built-in primitive types.
 *
 * @deprecated
 */
export class BuiltinPropertyValueSerializer extends DataTypeRegistry<(value: unknown) => string> implements PropertyValueSerializer {
    constructor() {
        super()
        this.register(stringDataType, (value) => value as string)
        this.register(booleanDataType, (value) => `${value as boolean}`)
        this.register(integerDataType, (value) => `${value as number}`)
        this.register(jsonDataType, (value) => asMinimalJsonString(value))
    }

    serializeValue(value: unknown | undefined, property: Property): string | null {
        if (value === undefined) {
            if (property.optional) {
                return null
            }
            throw new Error(`can't serialize undefined as the value of required property "${property.name}" (on classifier "${property.classifier.name}" in language "${property.classifier.language.name}")`)
        }
        const { type } = property
        if (isUnresolvedReference(type)) {
            throw new Error(`can't serialize property "${property.name}" (on classifier "${property.classifier.name}" in language "${property.classifier.language.name}") with unspecified type`)
        }
        const specificSerializer = this.byType(type)
        if (specificSerializer != undefined) {
            return specificSerializer(value)
        } else {
            throw new Error(`can't serialize value of property "${property.name}" (on classifier "${property.classifier.name}" in language "${property.classifier.language.name}") of type "${type!.name}": ${value}`)
        }
    }
}

/**
 * Misspelled alias of {@link BuiltinPropertyValueSerializer}, kept for backward compatibility, and to be deprecated and removed later.
 *
 * @deprecated
 */
export class DefaultPrimitiveTypeSerializer extends BuiltinPropertyValueSerializer {
}

