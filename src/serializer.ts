import {Containment, Property, Reference} from "./m3/types.ts"
import {SerializedModel, SerializedNode} from "./serialization.ts"
import {asIds, Node} from "./types.ts"
import {allFeaturesOf} from "./m3/functions.ts"
import {asArray} from "./m3/ecore/types.ts"
import {ConceptDeducer as _ConceptDeducer, ModelAPI} from "./api.ts"
import {BuiltinPrimitive, serializeBuiltin} from "./m3/builtins.ts"


/**
 * Serializes a model (i.e., an array of {@link Node nodes} - the first argument) to the LIonWeb serialization JSON format.
 * The {@link ModelAPI model API} given as second argument is used for its {@link _ConceptDeducer 'conceptOf' function}.
 */
export const serializeModel = <NT extends Node>(model: NT[], api: ModelAPI<NT>): SerializedModel /* <=> JSON */ => {
    const nodes: SerializedNode[] = []  // keep nodes as much as possible "in order"
    const ids: { [id: string]: boolean } = {}   // maintain a simple map to keep track of IDs of nodes that have been serialized

    const visit = (node: NT, parent?: NT) => {
        if (ids[node.id]) {
            return
        }

        const concept = api.conceptOf(node)
        const serializedNode: SerializedNode = {
            concept: concept.id,
            id: node.id,
            properties: {},
            children: {},
            references: {}
        }
        nodes.push(serializedNode)
        ids[node.id] = true
        allFeaturesOf(concept).forEach((feature) => {
            if (feature.derived) {
                return
            }
            const value = api.getFeatureValue(node, feature)
            if (feature instanceof Property && value !== undefined) {
                serializedNode.properties[feature.id] = serializeBuiltin(value as BuiltinPrimitive)
                return
            }
            if (feature instanceof Containment && asArray(value).length > 0) {
                const children = asArray(value) as NT[]
                serializedNode.children[feature.id] = asIds(children)
                children.forEach((child) => visit(child, node))
                return
            }
            if (feature instanceof Reference && asArray(value).length) {
                const targets = asArray(value)
                serializedNode.references[feature.id] = asIds(targets as NT[])
                return
            }
        })
        serializedNode.parent = parent?.id
    }

    model.forEach((node) => visit(node, undefined))

    return {
        serializationFormatVersion: 1,
        nodes
    }
}

/*
 * Note that the parametrization with a ConceptDeducer implies that the serialization will conform to a Metamodel (or a number of them).
 * This implies that models that _don't_ conform to a (set of) Metamodel(s) can't be serialized truthfully!
 */

