import { LionWebId, LionWebJsonChunk, LionWebJsonNode, LionWebJsonReferenceTarget } from "@lionweb/json"
import { asArray, keepDefineds, lazyMapGet, Nested3Map, uniquesAmong } from "@lionweb/ts-utils"
import { PropertyValueSerializerConfiguration, propertyValueSerializerWith } from "./data-types/property-values.js"
import { asIds, metaPointerForFeature } from "./functions.js"
import {
    Classifier,
    Containment,
    Feature,
    inheritsDirectlyFrom,
    Language,
    LionWebVersions,
    Property,
    Reference,
    simpleNameDeducer
} from "./m3/index.js"
import { isReferenceToSet, isResolvedReference, SingleRef, UnresolvedReference } from "./references.js"
import { Node } from "./types.js"
import { Reader } from "./reading.js"


/**
 * Type definition for functions that serializes nodes as a {@link LionWebJsonChunk serialization chunk}.
 */
export type Serializer<NT extends Node> = (nodes: NT[]) => LionWebJsonChunk

/**
 * Type for objects to configure {@link Serializer node serializers} with.
 * The `reader` property is mandatory,
 * and the `serializeEmptyFeatures`, and `propertyValueSerializer`.
 * properties are optional, with defined defaults.
 */
export type SerializerConfiguration<NT extends Node, RT extends Node = NT> = {

    /**
     * An interface with functions to “read” – i.e., introspect – nodes.
     */
    reader: Reader<NT, RT>

    /**
     * Determines whether empty feature values are explicitly serialized or skipped during serialization.
     * (The specification states that empty feature values SHOULD be serialized, but not that they MUST be.)
     * Default = true, meaning that empty feature values are *not* skipped.
     */
    serializeEmptyFeatures?: boolean

} & Omit<PropertyValueSerializerConfiguration, "enumerationLiteralFrom">


/**
 * @return a {@link Serializer} function that serializes the {@link Node nodes} passed to it,
 * configured through a `configuration` {@link SerializerConfiguration} object.
 */
export const serializerWith = <NT extends Node, RT extends Node = NT>(configuration: SerializerConfiguration<NT, RT>): Serializer<NT> => {
    const { reader } = configuration
    const lionWebVersion = configuration.lionWebVersion ?? LionWebVersions.v2023_1
    const serializeEmptyFeatures = configuration.serializeEmptyFeatures ?? true
    const propertyValueSerializer = propertyValueSerializerWith({
        enumerationLiteralFrom: reader.enumerationLiteralFrom,
        lionWebVersion,
        primitiveTypeSerializerRegistry: configuration.primitiveTypeSerializerRegistry,
        problemReporter: configuration.problemReporter
    })

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
                const featureMetaPointer = metaPointerForFeature(feature)
                if (feature instanceof Property) {
                    if (value === undefined && !serializeEmptyFeatures) {
                        // for immediate backward compatibility: skip empty property values regardless of options?.skipEmptyValues
                        return
                    }
                    serializedNode.properties.push({
                        property: featureMetaPointer,
                        value: value === undefined ? null : (propertyValueSerializer(feature, value) ?? null)   // (undefined -> null)
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
                        children: asIds(keepDefineds(children))
                    })
                    children.forEach(childOrNull => {
                        if (childOrNull !== null) {
                            visit(childOrNull, node)
                        }
                    })
                    return
                }
                if (feature instanceof Reference) {
                    const targets = (asArray(value) as SingleRef<RT>[]).filter((ref) => {
                        if (isResolvedReference(ref)) {
                            return true // (1) ref is a node, having an ID
                        }
                        if (isReferenceToSet(ref)) {
                            return false
                        }
                        return ref.targetId !== undefined || ref.resolveInfo !== undefined  // (2) not both are undefined
                    }) as (RT | UnresolvedReference)[]
                    if (targets.length === 0 && !serializeEmptyFeatures) {
                        return
                    }
                    serializedNode.references.push({
                        reference: featureMetaPointer,
                        targets: targets
                            .map((t) =>
                                t instanceof UnresolvedReference
                                    ? {
                                        resolveInfo: t.resolveInfo ?? null,
                                        reference: t.targetId ?? null
                                        // at least one of these will be non-null <== (2)
                                    } as LionWebJsonReferenceTarget
                                    : {
                                        resolveInfo: (reader.resolveInfoFor ? reader.resolveInfoFor(t, feature) : simpleNameDeducer(t, feature)) ?? null,
                                        reference: t.id
                                        // reference will be a non-null string (~(1))
                                    }
                            )
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
            serializationFormatVersion: lionWebVersion.serializationFormatVersion,
            languages: languagesUsed.map(({ key, version }) => ({ key, version })),
            nodes: serializedNodes
        }
    }
}

