import {ExtractionFacade} from "./facade.js"
import {currentSerializationFormatVersion, MetaPointer, SerializationChunk, SerializedNode} from "./serialization.js"
import {asIds} from "./functions.js"
import {Node} from "./types.js"
import {DefaultPrimitiveTypeSerializer} from "./m3/builtins.js"
import {allFeaturesOf} from "./m3/functions.js"
import {
    Containment,
    Enumeration,
    Language,
    PrimitiveType,
    Property,
    Reference,
    simpleNameDeducer
} from "./m3/types.js"
import {asArray} from "./utils/array-helpers.js"


export interface PrimitiveTypeSerializer {
    serializeValue(value: unknown, property: Property): string | undefined
}

/**
 * @return a {@link SerializationChunk} of the given model (i.e., an array of {@link Node nodes} - the first argument) to the LionWeb serialization JSON format.
 */
export const serializeNodes = <NT extends Node>(
    nodes: NT[],
    extractionFacade: ExtractionFacade<NT>,
    primitiveTypeSerializer: PrimitiveTypeSerializer = new DefaultPrimitiveTypeSerializer()
): SerializationChunk /* <=> JSON */ => {
    const serializedNodes: SerializedNode[] = []  // keep nodes as much as possible "in order"
    const ids: { [id: string]: boolean } = {}   // maintain a map to keep track of IDs of nodes that have been serialized
    const languagesUsed: Language[] = []
    const registerLanguageUsed = (language: Language) => {
        if (!languagesUsed.some((languageUsed) => language.equals(languageUsed))) {
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
        const serializedNode: SerializedNode = {
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
        allFeaturesOf(classifier).forEach((feature) => {
            const value = extractionFacade.getFeatureValue(node, feature)
            const featureLanguage = feature.classifier.language
            registerLanguageUsed(featureLanguage)
            const featureMetaPointer: MetaPointer = {
                language: featureLanguage.key,
                version: featureLanguage.version,
                key: feature.key
            }
            if (feature instanceof Property && value !== undefined) {
                const encodedValue = (() => {
                    // (could also just inspect type of value:)
                    if (feature.type instanceof PrimitiveType) {
                        return primitiveTypeSerializer.serializeValue(value, feature)
                    }
                    if (feature.type instanceof Enumeration) {
                        return extractionFacade.enumerationLiteralFrom(value, feature.type)?.key
                            ?? null // (undefined -> null)
                    }
                    return null
                })()
                if (encodedValue !== null) {
                    serializedNode.properties.push({
                        property: featureMetaPointer,
                        value: encodedValue as string
                    })
                }
                return
            }
            if (feature instanceof Containment) {
                const children = asArray(value) as (NT | null)[]
                serializedNode.containments.push({
                    containment: featureMetaPointer,
                    children: asIds(children)
                        .filter((childId) => childId !== null)
                        .map((childId) => childId as string)
                })
                children.forEach((childOrNull) => {
                    if (childOrNull !== null) {
                        visit(childOrNull, node);
                    }
                })
                return
            }
            if (feature instanceof Reference) {
                // Note: value can be null === typeof unresolved, e.g. on an unset (or previously unresolved) single-valued reference
                const targets = asArray(value) as (NT | null)[]
                serializedNode.references.push({
                    reference: featureMetaPointer,
                    targets: targets
                        .filter((tOrNull) => tOrNull !== null)  // (skip "non-connected" targets)
                        .map((t) => t as NT)
                        .map((t) => ({
                            resolveInfo: (extractionFacade.resolveInfoFor
                                ? extractionFacade.resolveInfoFor(t)
                                : simpleNameDeducer(t)) ?? null,
                            reference: t.id
                        })
                    )
                })
                return
            }
        })

        const annotations = asArray(node.annotations) as NT[]   // assumes that annotations also all are of type NT (which is not unreasonable)
        serializedNode.annotations = annotations.map((annotation) => annotation.id)
        annotations.forEach((annotation) => visit(annotation, node))

        serializedNode.parent = parent?.id ?? null  // (undefined -> null)
    }

    nodes.forEach((node) => visit(node, undefined))

    return {
        serializationFormatVersion: currentSerializationFormatVersion,
        languages: languagesUsed
            .map(({key, version}) => ({ key, version })),
        nodes: serializedNodes
    }
}

