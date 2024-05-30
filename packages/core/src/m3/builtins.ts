import {LanguageFactory} from "./factory.js"
import {Classifier, Concept, Datatype, lioncoreBuiltinsKey, Property} from "./types.js"
import {StringsMapper} from "../utils/string-mapping.js"
import {currentReleaseVersion} from "../version.js"
import {PrimitiveTypeDeserializer} from "../deserializer.js"
import {PrimitiveTypeSerializer} from "../serializer.js"


const lioncoreBuiltinsIdAndKeyGenerator: StringsMapper =
    (...names) => [lioncoreBuiltinsKey, ...names.slice(1)].join("-")


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
       classifier instanceof Concept
    && classifier.language.key === lioncoreBuiltinsKey
    && classifier.language.version === currentReleaseVersion
    && classifier.key === builtinClassifiers.node.key
    && (classifier as Concept).abstract


const inamed = factory.interface("INamed")

const inamed_name = factory.property(inamed, "name")
    .ofType(stringDatatype)

inamed.havingFeatures(inamed_name)


lioncoreBuiltins.havingEntities(
    stringDatatype,
    booleanDatatype,
    integerDatatype,
    jsonDatatype,
    node,
    inamed
)


type BuiltinPrimitive = string | boolean | number | Record<string, unknown> | Array<unknown>
type PrimitiveTypeValue = BuiltinPrimitive | unknown
type SpecificPrimitiveTypeDeserializer = (value: string) => PrimitiveTypeValue
type SpecificPrimitiveTypeSerializer = (value: unknown) => string

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

export class DefaultPrimitiveTypeDeserializer implements PrimitiveTypeDeserializer {

    private deserializerByType = new Map<Datatype, SpecificPrimitiveTypeDeserializer>()

    constructor() {
        this.registerDeserializer(stringDatatype, (value) => value)
        this.registerDeserializer(booleanDatatype, (value) => JSON.parse(value))
        this.registerDeserializer(integerDatatype, (value) => Number(value))
        this.registerDeserializer(jsonDatatype, (value) => JSON.parse(value as string))
    }

    registerDeserializer(dataType: Datatype, deserializer: SpecificPrimitiveTypeDeserializer) {
        this.deserializerByType.set(dataType, deserializer)
    }

    deserializeValue(value: string | undefined, property: Property): PrimitiveTypeValue | undefined {
        if (value === undefined) {
            if (property.optional) {
                return undefined
            }
            throw new Error(`can't deserialize undefined as the value of a required property`)
        }
        const { type } = property
        if (type == null) {
            throw new Error(`cant't deserialize a property with unspecified type`)
        }
        const specificDeserializer = this.deserializerByType.get(type)
        if (specificDeserializer != null) {
            return specificDeserializer(value)
        } else {
            throw new Error(`can't deserialize value of type "${type!.name}": ${value}`)
        }
    }
}

export class DefaultPrimitiveTypeSerializer implements PrimitiveTypeSerializer {

    private serializerByType = new Map<Datatype, SpecificPrimitiveTypeSerializer>()

    constructor() {
        this.registerSerializer(stringDatatype, (value) => value as string);
        this.registerSerializer(stringDatatype, (value) => value as string)
        this.registerSerializer(booleanDatatype, (value) => `${value as boolean}`)
        this.registerSerializer(integerDatatype, (value) => `${value as number}`)
        this.registerSerializer(jsonDatatype, (value) => JSON.stringify(value, null))
    }

    registerSerializer(dataType: Datatype, serializer: SpecificPrimitiveTypeSerializer) {
        this.serializerByType.set(dataType, serializer)
    }

    serializeValue(value: unknown | undefined, property: Property): string | undefined {
        if (value === undefined) {
            if (property.optional) {
                return undefined
            }
            throw new Error(`can't serialize undefined as the value of a required property`)
        }
        const { type } = property
        if (type == null) {
            throw new Error(`cant't serialize a property with unspecified type`)
        }
        const specificSerializer = this.serializerByType.get(type)
        if (specificSerializer != undefined) {
            return specificSerializer(value)
        } else {
            throw new Error(`can't serialize value of type "${type!.name}": ${value}`)
        }
    }
}

export type {
    BuiltinPrimitive
}

export {
    builtinPrimitives,
    builtinClassifiers,
    builtinFeatures,
    isBuiltinNodeConcept,
    lioncoreBuiltins
}

