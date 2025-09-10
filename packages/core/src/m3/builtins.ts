import { asMinimalJsonString, StringsMapper } from "@lionweb/ts-utils"
import { PropertyValueDeserializer } from "../deserializer.js"
import { PropertyValueSerializer } from "../serializer.js"
import { currentReleaseVersion } from "../version.js"
import { LanguageFactory } from "./factory.js"
import { Classifier, Concept, DataType, lioncoreBuiltinsKey, Property } from "./types.js"

const lioncoreBuiltinsIdAndKeyGenerator: StringsMapper = (...names) => [lioncoreBuiltinsKey, ...names.slice(1)].join("-")

const factory = new LanguageFactory(
    "LionCore_builtins",
    currentReleaseVersion,
    lioncoreBuiltinsIdAndKeyGenerator,
    lioncoreBuiltinsIdAndKeyGenerator
)
/*
 * ID == key: `LionCore-builtins-${qualified name _without_ "LionCore-builtins", dash-separated}`
 */

/**
 * Definition of a LionCore language that serves as a standard library of built-in primitive types.
 */
const lioncoreBuiltins = factory.language

const stringDataType = factory.primitiveType("String")
const booleanDataType = factory.primitiveType("Boolean")
const integerDataType = factory.primitiveType("Integer")
const jsonDataType = factory.primitiveType("JSON")

const node = factory.concept("Node", true)

const isBuiltinNodeConcept = (classifier: Classifier) =>
    classifier instanceof Concept &&
    classifier.language.key === lioncoreBuiltinsKey &&
    classifier.language.version === currentReleaseVersion &&
    classifier.key === builtinClassifiers.node.key &&
    (classifier as Concept).abstract

const inamed = factory.interface("INamed")

const inamed_name = factory.property(inamed, "name").ofType(stringDataType)

const builtinPrimitives = {
    stringDataType,
    booleanDataType,
    integerDataType,
    jsonDataType,
    /**
     * Misspelled alias of {@link stringDataType}, kept for backward compatibility, and to be deprecated and removed later.
     */
    stringDatatype: stringDataType,
    /**
     * Misspelled alias of {@link booleanDataType}, kept for backward compatibility, and to be deprecated and removed later.
     */
    booleanDatatype: booleanDataType,
    /**
     * Misspelled alias of {@link integerDataType}, kept for backward compatibility, and to be deprecated and removed later.
     */
    integerDatatype: integerDataType,
    /**
     * Misspelled alias of {@link jsonDataType}, kept for backward compatibility, and to be deprecated and removed later.
     */
    jsonDatatype: jsonDataType
}

const builtinClassifiers = {
    node,
    inamed
}

const builtinFeatures = {
    inamed_name
}

/**
 * Determines whether two data types should be structurally equal based on equality of: meta type, key, and language's key.
 */
const shouldBeIdentical = (left: DataType, right: DataType): boolean =>
    left.key === right.key && left.language.key === right.language.key && left.metaType() === right.metaType()

abstract class DataTypeRegister<T> {
    private map = new Map<DataType, T>()

    public register(dataType: DataType, t: T) {
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

export class BuiltinPropertyValueDeserializer
    extends DataTypeRegister<(value: string) => unknown>
    implements PropertyValueDeserializer
{
    constructor() {
        super()
        this.register(stringDataType, value => value)
        this.register(booleanDataType, value => JSON.parse(value))
        this.register(integerDataType, value => Number(value))
        this.register(jsonDataType, value => JSON.parse(value as string))
    }

    deserializeValue(value: string | undefined, property: Property): unknown | undefined {
        if (value === undefined) {
            if (property.optional) {
                return undefined
            }
            throw new Error(`can't deserialize undefined as the value of required property "${property.name}" (on classifier "${property.classifier.name}" in language "${property.classifier.language.name}")`)
        }
        const { type } = property
        if (type == null) {
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
 */
export class DefaultPrimitiveTypeDeserializer extends BuiltinPropertyValueDeserializer {}


export class BuiltinPropertyValueSerializer extends DataTypeRegister<(value: unknown) => string> implements PropertyValueSerializer {
    constructor() {
        super()
        this.register(stringDataType, value => value as string)
        this.register(booleanDataType, value => `${value as boolean}`)
        this.register(integerDataType, value => `${value as number}`)
        this.register(jsonDataType, value => asMinimalJsonString(value))
    }

    serializeValue(value: unknown | undefined, property: Property): string | null {
        if (value === undefined) {
            if (property.optional) {
                return null
            }
            throw new Error(`can't serialize undefined as the value of required property "${property.name}" (on classifier "${property.classifier.name}" in language "${property.classifier.language.name}")`)
        }
        const { type } = property
        if (type == null) {
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
 */
export class DefaultPrimitiveTypeSerializer extends BuiltinPropertyValueSerializer {}

export { builtinPrimitives, builtinClassifiers, builtinFeatures, isBuiltinNodeConcept, lioncoreBuiltins, shouldBeIdentical }
