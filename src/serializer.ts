import {Containment, Property, Reference} from "./m3/types.ts"
import {SerializedModel, SerializedNode} from "./serialization.ts"
import {asIds, Node} from "./types.ts"
import {allFeaturesOf} from "./m3/functions.ts"
import {asArray} from "./m3/ecore/types.ts"
import {ConceptDeducer as _ConceptDeducer, ModelAPI} from "./api.ts"


/**
 * Serializes a model (i.e., an array of {@link Node nodes} - the first argument) to the LIonWeb serialization JSON format.
 * The {@link ModelAPI model API} given as second argument is used for its {@link _ConceptDeducer 'conceptFor' function}.
 */
export const serializeModel = <NT extends Node>(model: NT[], modelAPI: ModelAPI<NT>): SerializedModel /* <=> JSON */ => {
    const nodes: SerializedNode[] = []

    const visit = (node: NT, parent?: Node) => {
        const concept = modelAPI.conceptOf(node)
        const serializedNode: SerializedNode = {
            concept: concept.id,
            id: node.id
        }
        nodes.push(serializedNode)
        allFeaturesOf(concept).forEach((feature) => {
            const name = feature.simpleName
            if (feature.derived || !(name in node)) {
                return
            }
            const value = (node as any)[name]
            if (feature instanceof Property) {
                if (!("properties" in serializedNode)) {
                    serializedNode.properties = {}
                }
                serializedNode.properties![feature.id] = value
                return
            }
            if (feature instanceof Containment) {   // TODO (#33)  && asArray(value).length > 0 or similar
                if (!("children" in serializedNode)) {
                    serializedNode.children = {}
                }
                const children = asArray(value)
                serializedNode.children![feature.id] = asIds(children)
                children.forEach((child) => visit(child, node))
                return
            }
            if (feature instanceof Reference) {   // TODO (#33)  && asArray(value).length > 0 or similar
                if (!("references" in serializedNode)) {
                    serializedNode.references = {}
                }
                const targets = asArray(value)
                serializedNode.references![feature.id] = asIds(targets)
                return
            }
        })
        if (parent !== undefined) {
            serializedNode.parent = parent.id
        }
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

