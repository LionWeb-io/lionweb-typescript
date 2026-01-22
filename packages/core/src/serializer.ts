import { currentSerializationFormatVersion, LionWebId, LionWebJsonChunk, LionWebJsonNode } from "@lionweb/json"
import { asArray, keepDefineds, lazyMapGet, Nested3Map, uniquesAmong } from "@lionweb/ts-utils"
import { asIds, metaPointerFor } from "./functions.js"
import { Reader } from "./reading.js"
import { Node } from "./types.js"
import { lioncoreBuiltinsFacade } from "./m3/builtins.js"
import { inheritsDirectlyFrom } from "./m3/functions.js"
import {
    Classifier,
    Containment,
    Enumeration,
    Feature,
    Language,
    PrimitiveType,
    Property,
    Reference,
    simpleNameDeducer
} from "./m3/types.js"


/**
 * Type definition for functions that serializes nodes as a {@link LionWebJsonChunk serialization chunk}.
 */
export type Serializer<NT extends Node> = (nodes: NT[]) => LionWebJsonChunk


/**
 * Interface for objects that expose a method to serialize a property's value.
 */
export interface PropertyValueSerializer {
    serializeValue(value: unknown, property: Property): string | null
}

/**
 * Misspelled alias of {@link PropertyValueSerializer}, kept for backward compatibility, and to be deprecated and removed later.
 */
export interface PrimitiveTypeSerializer extends PropertyValueSerializer {}


const isPropertyValueSerializer = (value: unknown): value is PropertyValueSerializer =>
    typeof value === "object" && value !== null && "serializeValue" in value && typeof value.serializeValue === "function"
        // (we can't check the rest of the signature – i.e. arguments and their types – at runtime, because that's JavaScript)


/**
 * Type to provide (non-required) options to the serializer.
 */
export type SerializationOptions = Partial<{

    /**
     * Determines whether empty feature values are explicitly serialized or skipped during serialization.
     * (The specification states that empty feature values SHOULD be serialized, but not that they MUST be.)
     * Default = true, meaning that empty feature values are *not* skipped.
     */
    serializeEmptyFeatures: boolean

    /**
     * A {@link PropertyValueSerializer} implementation.
     * Default = {@link builtinPropertyValueSerializer}.
     */
    propertyValueSerializer: PropertyValueSerializer

    /**
     * Misspelled alias of {@link #propertyValueSerializer}, kept for backward compatibility, and to be deprecated and removed later.
     */
    primitiveTypeSerializer: PropertyValueSerializer

}>


/**
 * Type for objects to configure {@link Serializer node serializers} with.
 * The `reader` property is mandatory,
 * and the `serializeEmptyFeatures`, `propertyValueSerializer`,
 * and `primitiveTypeSerializer` (which is a legacy alias for `propertyValueSerializer`)
 * properties are optional, with defined defaults.
 */
export type SerializerConfiguration<NT extends Node> = {
    /**
     * An interface with functions to “read” – i.e., introspect – nodes.
     */
    reader: Reader<NT>
} & SerializationOptions


/**
 * @return a {@link Serializer} function that serializes the {@link Node nodes} passed to it,
 * configured through a `reader` {@link Reader} instance,
 * and (optionally) a `serializationOptions` {@link SerializationOptions} object.
 *
 * This is a legacy version of {@link serializerWith}, kept for backward compatibility, and to be deprecated and removed later.
 */
export const nodeSerializer = <NT extends Node>(reader: Reader<NT>, serializationOptions?: SerializationOptions): Serializer<NT> =>
    serializerWith({ reader, ...serializationOptions })


/**
 * @return a {@link Serializer} function that serializes the {@link Node nodes} passed to it,
 * configured through a `configuration` {@link SerializerConfiguration} object.
 */
export const serializerWith = <NT extends Node>(configuration: SerializerConfiguration<NT>): Serializer<NT> => {
    const { reader } = configuration
    const propertyValueSerializer =
        configuration.propertyValueSerializer ?? configuration.primitiveTypeSerializer ?? lioncoreBuiltinsFacade.propertyValueSerializer
    const serializeEmptyFeatures = configuration.serializeEmptyFeatures ?? true

    const languageKey2version2classifierKey2allFeatures: Nested3Map<Feature[]> = {}
    const memoisedAllFeaturesOf = (classifier: Classifier): Feature[] =>
        lazyMapGet(
            lazyMapGet(
                lazyMapGet(
                    languageKey2version2classifierKey2allFeatures,
                    classifier.language.key,
                    () => ({})
                ),
                classifier.language.version,
                () => ({})
            ),
            classifier.key,
            () => uniquesAmong( // make unique in case a feature was inherited from multiple super-classifiers
                [ ...classifier.features, ...(inheritsDirectlyFrom(classifier).flatMap(memoisedAllFeaturesOf)) ]
                /*
                 * [NOTE]
                 * The allFeaturesOf function uses flatMapNonCyclingFollowing which avoids that features of a super-classifier are added multiple times.
                 * Unfortunately, to make use of the memoising, we can't use flatMapNonCyclingFollowing in the same way here.
                 * So, we have to remove duplicates ourselves.
                 */
            )
        )

    return (nodes: NT[]): LionWebJsonChunk => {
        const serializedNodes: LionWebJsonNode[] = [] // keep nodes as much as possible "in order"
        const ids: { [id: LionWebId]: boolean } = {} // maintain a map to keep track of IDs of nodes that have been serialized
        const languagesUsed: Language[] = []
        const usedLanguageKey2Version2Boolean: { [key: string]: { [version: string]: boolean } } = {}
        const registerLanguageUsed = (language: Language) => {
            const version2Boolean = lazyMapGet<{ [version: string]: boolean }>(usedLanguageKey2Version2Boolean, language.key, () => ({}))
            if (!version2Boolean[language.version]) {
                version2Boolean[language.version] = true
                languagesUsed.push(language)
            }
        }

        const visit = (node: NT, parent?: NT) => {
            if (node.id in ids) {
                return
            }

            const classifier = reader.classifierOf(node)
            const language = classifier.language
            registerLanguageUsed(language)
            const serializedNode: LionWebJsonNode = {
                id: node.id,
                classifier: classifier.metaPointer(),
                properties: [],
                containments: [],
                references: [],
                annotations: [],
                parent: null
            }
            serializedNodes.push(serializedNode)
            ids[node.id] = true
            memoisedAllFeaturesOf(classifier).forEach((feature) => {
                const value = reader.getFeatureValue(node, feature)
                const featureLanguage = feature.classifier.language
                registerLanguageUsed(featureLanguage)
                const featureMetaPointer = metaPointerFor(feature)
                if (feature instanceof Property) {
                    if (value === undefined && !serializeEmptyFeatures) {
                        // for immediate backward compatibility: skip empty property values regardless of options?.skipEmptyValues
                        return
                    }
                    const encodedValue = (() => {
                        // (could also just inspect type of value:)
                        if (feature.type instanceof PrimitiveType) {
                            return propertyValueSerializer.serializeValue(value, feature)
                        }
                        if (feature.type instanceof Enumeration) {
                            return reader.enumerationLiteralFrom(value, feature.type)?.key
                        }
                        return undefined
                    })()
                    serializedNode.properties.push({
                        property: featureMetaPointer,
                        value: (encodedValue as string) ?? null // (undefined -> null)
                    })
                    return
                }
                if (feature instanceof Containment) {
                    const children = asArray(value) as (NT | null)[]
                    if (children.length === 0 && !serializeEmptyFeatures) {
                        return
                    }
                    serializedNode.containments.push({
                        containment: featureMetaPointer,
                        children: keepDefineds(asIds(children))
                            .map(childId => childId as string)
                    })
                    children.forEach(childOrNull => {
                        if (childOrNull !== null) {
                            visit(childOrNull, node)
                        }
                    })
                    return
                }
                if (feature instanceof Reference) {
                    // Note: value can be null === typeof unresolved, e.g. on an unset (or previously unresolved) single-valued reference
                    const targets = asArray(value) as (NT | null)[]
                    if (targets.length === 0 && !serializeEmptyFeatures) {
                        return
                    }
                    serializedNode.references.push({
                        reference: featureMetaPointer,
                        targets: keepDefineds(targets) // (skip "non-connected" targets)
                            .map(t => t as NT)
                            .map(t => ({
                                resolveInfo:
                                    (reader.resolveInfoFor ? reader.resolveInfoFor(t, feature) : simpleNameDeducer(t, feature)) ?? null,
                                reference: t.id
                            }))
                    })
                    return
                }
            })

            const annotations = asArray(node.annotations) as NT[] // assumes that annotations also all are of type NT (which is not unreasonable)
            serializedNode.annotations = annotations.map(annotation => annotation.id)
            annotations.forEach(annotation => visit(annotation, node))

            serializedNode.parent = parent?.id ?? null // (undefined -> null)
        }

        nodes.forEach(node => visit(node, undefined))

        return {
            serializationFormatVersion: currentSerializationFormatVersion,
            languages: languagesUsed.map(({ key, version }) => ({ key, version })),
            nodes: serializedNodes
        }
    }
}

/**
 * @return a {@link LionWebJsonChunk} of the given model (i.e., an array of {@link Node nodes} - the first argument) to the LionWeb serialization JSON format.
 *  *Note:* this function will be deprecated and removed later — use {@link nodeSerializer} instead.
 */
export const serializeNodes = <NT extends Node>(
    nodes: NT[],
    reader: Reader<NT>,
    propertyValueSerializerOrOptions?: PropertyValueSerializer | SerializationOptions
): LionWebJsonChunk =>
    nodeSerializer<NT>(
        reader,
        isPropertyValueSerializer(propertyValueSerializerOrOptions)
            ? {
                propertyValueSerializer: propertyValueSerializerOrOptions
            }
            : propertyValueSerializerOrOptions
    )(nodes)

