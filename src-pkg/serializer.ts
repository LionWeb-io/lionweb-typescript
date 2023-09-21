import {ReadModelAPI} from "./api.js"
import {MetaPointer, SerializationChunk, serializationFormatVersion, SerializedNode} from "./serialization.js"
import {asIds} from "./functions.js"
import {Node} from "./types.js"
import {Containment, Enumeration, isINamed, Language, PrimitiveType, Property, Reference} from "./m3/types.js"
import {allFeaturesOf} from "./m3/functions.js"
import {asArray} from "./utils/array-helpers.js"
import {BuiltinPrimitive, lioncoreBuiltins, serializeBuiltin} from "./m3/builtins.js"


/**
 * @return a {@link SerializationChunk} of the given model (i.e., an array of {@link Node nodes} - the first argument) to the LionWeb serialization JSON format.
 */
export const serializeNodes = <NT extends Node>(nodes: NT[], api: ReadModelAPI<NT>): SerializationChunk /* <=> JSON */ => {
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

        const concept = api.conceptOf(node)
        const language = concept.language
        registerLanguageUsed(language)
        const serializedNode: SerializedNode = {
            id: node.id,
            concept: {
                language: language.key,
                version: language.version,
                key: concept.key
            },
            properties: [],
            children: [],
            references: [],
            parent: null
        }
        serializedNodes.push(serializedNode)
        ids[node.id] = true
        allFeaturesOf(concept).forEach((feature) => {
            const value = api.getFeatureValue(node, feature)
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
                        return serializeBuiltin(value as BuiltinPrimitive)
                    }
                    if (feature.type instanceof Enumeration) {
                        return api.enumerationLiteralFrom(value, feature.type)?.key
                            ?? null // (undefined -> null)
                    }
                    return null
                })()
                if (encodedValue !== null) {
                    serializedNode.properties.push({
                        property: featureMetaPointer,
                        value: encodedValue
                    })
                }
                return
            }
            if (feature instanceof Containment) {
                const children = asArray(value) as NT[]
                serializedNode.children.push({
                    containment: featureMetaPointer,
                    children: asIds(children)
                })
                children.forEach((child) => visit(child, node))
                return
            }
            if (feature instanceof Reference) {
                const targets = asArray(value)
                serializedNode.references.push({
                    reference: featureMetaPointer,
                    targets: (targets as NT[]).map((t) => ({
                        resolveInfo: isINamed(t) ? t.name : undefined,
                        reference: t.id
                    }))
                })
                return
            }
        })
        serializedNode.parent = parent?.id ?? null  // (undefined -> null)
    }

    nodes.forEach((node) => visit(node, undefined))

    return {
        serializationFormatVersion,
        languages: languagesUsed
            .filter((language) => !language.equals(lioncoreBuiltins))
            .map(({key, version}) => ({ key, version })),
        nodes: serializedNodes
    }
}

