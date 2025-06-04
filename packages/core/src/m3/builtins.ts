import { StringsMapper } from "@lionweb/ts-utils"
import { PrimitiveTypeDeserializer } from "../deserializer.js"
import { PrimitiveTypeSerializer } from "../serializer.js"
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

const stringDatatype = factory.primitiveType("String")
const booleanDatatype = factory.primitiveType("Boolean")
const integerDatatype = factory.primitiveType("Integer")
const jsonDatatype = factory.primitiveType("JSON")

const node = factory.concept("Node", true)

const isBuiltinNodeConcept = (classifier: Classifier) =>
    classifier instanceof Concept &&
    classifier.language.key === lioncoreBuiltinsKey &&
    classifier.language.version === currentReleaseVersion &&
    classifier.key === builtinClassifiers.node.key &&
    (classifier as Concept).abstract

const inamed = factory.interface("INamed")

const inamed_name = factory.property(inamed, "name").ofType(stringDatatype)

const builtinPrimitives = {
    stringDatatype,
    booleanDatatype,
    integerDatatype,
    jsonDatatype
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

export class DefaultPrimitiveTypeDeserializer
    extends DataTypeRegister<(value: string) => unknown>
    implements PrimitiveTypeDeserializer
{
    constructor() {
        super()
        this.register(stringDatatype, value => value)
        this.register(booleanDatatype, value => JSON.parse(value))
        this.register(integerDatatype, value => Number(value))
        this.register(jsonDatatype, value => JSON.parse(value as string))
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

export class BuiltinPropertyValueSerializer extends DataTypeRegister<(value: unknown) => string> implements PrimitiveTypeSerializer {
    constructor() {
        super()
        this.register(stringDatatype, value => value as string)
        this.register(booleanDatatype, value => `${value as boolean}`)
        this.register(integerDatatype, value => `${value as number}`)
        this.register(jsonDatatype, value => JSON.stringify(value, null))
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

export { builtinPrimitives, builtinClassifiers, builtinFeatures, isBuiltinNodeConcept, lioncoreBuiltins, shouldBeIdentical }
