import {ConceptDeducer as _ConceptDeducer, ModelAPI} from "./api.ts"
import {SerializedModel, SerializedNode} from "./serialization.ts"
import {asIds} from "./functions.ts"
import {Node} from "./types.ts"
import {Containment, Property, Reference} from "./m3/types.ts"
import {allFeaturesOf} from "./m3/functions.ts"
import {asArray} from "./utils/array-helpers.ts"
import {BuiltinPrimitive, serializeBuiltin} from "./m3/builtins.ts"


/**
 * Serializes a model (i.e., an array of {@link Node nodes} - the first argument) to the LIonWeb serialization JSON format.
 * The {@link ModelAPI model API} given as second argument is used for its {@link _ConceptDeducer 'conceptOf' function}.
 * This usage implies that the serialization will conform to (the metamodel of) a particular {@link Language language},
 * which means that models that _don't_ conform to a (given) language can't be serialized truthfully!
 */
export const serializeModel = <NT extends Node>(model: NT[], api: ModelAPI<NT>): SerializedModel /* <=> JSON */ => {
    const nodes: SerializedNode[] = []  // keep nodes as much as possible "in order"
    const ids: { [id: string]: boolean } = {}   // maintain a map to keep track of IDs of nodes that have been serialized

    const visit = (node: NT, parent?: NT) => {
        if (ids[node.id]) {
            return
        }

        // TODO  get actual metamodel and version infos

        const concept = api.conceptOf(node)
        const serializedNode: SerializedNode = {
            id: node.id,
            concept: {
                language: "LIonCore_M3",
                version: "1",
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
            if (feature instanceof Property && value !== undefined) {
                serializedNode.properties.push({
                    property: {
                        // FIXME  proper metamodel+version
                        language: "LIonCore_M3",
                        version: "1",
                        key: feature.key
                    },
                    value: serializeBuiltin(value as BuiltinPrimitive)
                })
                return
            }
            if (feature instanceof Containment && asArray(value).length > 0) {
                const children = asArray(value) as NT[]
                serializedNode.children.push({
                    containment: {
                        // FIXME  proper metamodel+version
                        language: "LIonCore_M3",
                        version: "1",
                        key: feature.key
                    },
                    children: asIds(children)
                })
                children.forEach((child) => visit(child, node))
                return
            }
            if (feature instanceof Reference && asArray(value).length > 0) {
                const targets = asArray(value)
                serializedNode.references.push({
                    reference: {
                        // FIXME  proper metamodel+version
                        language: "LIonCore_M3",
                        version: "1",
                        key: feature.key
                    },
                    targets: (targets as NT[]).map((t) => ({ reference: t.id }))
                        // TODO  also provide resolveInfo
                })
                return
            }
        })
        serializedNode.parent = parent?.id ?? null
    }

    model.forEach((node) => visit(node, undefined))

    return {
        serializationFormatVersion: "1",
        // FIXME  proper metamodels
        languages: [],
        nodes
    }
}

