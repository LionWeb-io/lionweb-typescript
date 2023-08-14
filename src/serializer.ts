import {ConceptDeducer as _ConceptDeducer, ModelAPI} from "./api.ts"
import {MetaPointer, SerializedModel, SerializedNode} from "./serialization.ts"
import {asIds} from "./functions.ts"
import {Node} from "./types.ts"
import {Containment, isINamed, Language, Property, Reference} from "./m3/types.ts"
import {allFeaturesOf} from "./m3/functions.ts"
import {asArray} from "./utils/array-helpers.ts"
import {BuiltinPrimitive, lioncoreBuiltins, serializeBuiltin} from "./m3/builtins.ts"


/**
 * Serializes a model (i.e., an array of {@link Node nodes} - the first argument) to the LIonWeb serialization JSON format.
 * The {@link ModelAPI model API} given as second argument is used for its {@link _ConceptDeducer 'conceptOf' function}.
 * This usage implies that the serialization will conform to (the metamodel of) a particular {@link Language language},
 * which means that models that _don't_ conform to a (given) language can't be serialized truthfully!
 */
export const serializeModel = <NT extends Node>(model: NT[], api: ModelAPI<NT>): SerializedModel /* <=> JSON */ => {
    const nodes: SerializedNode[] = []  // keep nodes as much as possible "in order"
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
        nodes.push(serializedNode)
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
                serializedNode.properties.push({
                    property: featureMetaPointer,
                    value: serializeBuiltin(value as BuiltinPrimitive)
                })
                return
            }
            if (feature instanceof Containment /* && asArray(value).length > 0 */) {
                const children = asArray(value) as NT[]
                serializedNode.children.push({
                    containment: featureMetaPointer,
                    children: asIds(children)
                })
                children.forEach((child) => visit(child, node))
                return
            }
            if (feature instanceof Reference /* && asArray(value).length > 0 */) {
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
        serializedNode.parent = parent?.id ?? null
    }

    model.forEach((node) => visit(node, undefined))

    return {
        serializationFormatVersion: "1",
        languages: languagesUsed
            .filter((language) => !language.equals(lioncoreBuiltins))
            .map(({key, version}) => ({ key, version })),
        nodes
    }
}

