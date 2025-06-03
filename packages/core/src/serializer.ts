import { currentSerializationFormatVersion, LionWebId, LionWebJsonChunk, LionWebJsonMetaPointer, LionWebJsonNode } from "@lionweb/json"
import { asArray } from "@lionweb/ts-utils"
import { ExtractionFacade } from "./facade.js"
import { asIds } from "./functions.js"
import { BuiltinPropertyValueSerializer } from "./m3/builtins.js"
import { allFeaturesOf } from "./m3/functions.js"
import { Containment, Enumeration, Feature, Language, PrimitiveType, Property, Reference, simpleNameDeducer } from "./m3/types.js"
import { Node } from "./types.js"


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
 * Type to provide options to the serializer.
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
     * Default = DefaultPropertyValueSerializer.
     */
    propertyValueSerializer: PropertyValueSerializer

    /**
     * Misspelled alias of {@link #propertyValueSerializer}, kept for backward compatibility, and to be deprecated and removed later.
     */
    primitiveTypeSerializer: PropertyValueSerializer
}>

/**
 * @return the {@link LionWebJsonMetaPointer} for the given {@link Feature}.
 */
export const metaPointerFor = (feature: Feature): LionWebJsonMetaPointer => {
    const { language } = feature.classifier
    return {
        language: language.key,
        version: language.version,
        key: feature.key
    }
}

/**
 * @return a {@link LionWebJsonChunk} of the given model (i.e., an array of {@link Node nodes} - the first argument) to the LionWeb serialization JSON format.
 */
export const serializeNodes = <NT extends Node>(
    nodes: NT[],
    extractionFacade: ExtractionFacade<NT>,
    propertyValueSerializerOrOptions?: PropertyValueSerializer | SerializationOptions
): LionWebJsonChunk /* <=> JSON */ => {
    const options: SerializationOptions =
        isPropertyValueSerializer(propertyValueSerializerOrOptions)
            ? {
                propertyValueSerializer: propertyValueSerializerOrOptions
            }
            : (propertyValueSerializerOrOptions ?? {})
    const propertyValueSerializer =
        options.propertyValueSerializer ?? options.primitiveTypeSerializer ?? new BuiltinPropertyValueSerializer()
    const serializeEmptyFeatures = options.serializeEmptyFeatures ?? true

    const serializedNodes: LionWebJsonNode[] = [] // keep nodes as much as possible "in order"
    const ids: { [id: LionWebId]: boolean } = {} // maintain a map to keep track of IDs of nodes that have been serialized
    const languagesUsed: Language[] = []
    const registerLanguageUsed = (language: Language) => {
        if (!languagesUsed.some(languageUsed => language.equals(languageUsed))) {
            languagesUsed.push(language)
        }
    }

    const visit = (node: NT, parent?: NT) => {
        if (ids[node.id]) {
            return
        }

        const classifier = extractionFacade.classifierOf(node)
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
        allFeaturesOf(classifier).forEach(feature => {
            const value = extractionFacade.getFeatureValue(node, feature)
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
                        return extractionFacade.enumerationLiteralFrom(value, feature.type)?.key
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
                    children: asIds(children)
                        .filter(childId => childId !== null)
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
                    targets: targets
                        .filter(tOrNull => tOrNull !== null) // (skip "non-connected" targets)
                        .map(t => t as NT)
                        .map(t => ({
                            resolveInfo:
                                (extractionFacade.resolveInfoFor ? extractionFacade.resolveInfoFor(t) : simpleNameDeducer(t)) ?? null,
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
