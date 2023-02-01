import {
    Concept,
    Containment,
    Metamodel,
    Property,
    Reference
} from "./m3/types.ts"
import {SerializedModel, SerializedNode} from "./serialization.ts"
import {asIds, Node} from "./types.ts"
import {allFeaturesOf} from "./m3/functions.ts"
import {asArray} from "./m3/ecore/types.ts"


/**
 * Type definition for a function that deduces which {@link Concept concept} a given {@link Node model node} conforms to.
 */
export type ConceptDeducer = (node: Node) => Concept


/*
 * Note that the parametrization with a ConceptDeducer implies that the serialization will conform to a Metamodel (or a number of them).
 * This implies that models that _don't_ conform to a (set of) Metamodel(s) can't be serialized truthfully!
 */

/**
 * Serializes a model (i.e., an array of {@link Node nodes} - the first argument) to the LIonWeb serialization JSON format.
 * The {@link ConceptDeducer concept deducer function} given as second argument is used to map nodes to their concepts.
 */
export const serializeModel = (model: Node[], conceptOf: ConceptDeducer): SerializedModel /* <=> JSON */ => {
    const nodes: SerializedNode[] = []

    const visit = (node: Node, parent?: Node) => {
        const concept = conceptOf(node)
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
            if (feature instanceof Containment) {   // TODO  && asArray(value).length > 0 or similar
                if (!("children" in serializedNode)) {
                    serializedNode.children = {}
                }
                const children = asArray(value)
                serializedNode.children![feature.id] = asIds(children)
                children.forEach((child) => visit(child, node))
                return
            }
            if (feature instanceof Reference) {   // TODO  && asArray(value).length > 0 or similar
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


/**
 * @return a {@link ConceptDeducer concept deducer} that deduces the concept of nodes by looking up
 * the concept in the given {@link Metamodel metamodel} by matching the node object's class name to the concept's simple name.
 */
export const classBasedConceptDeducerFor = (metamodel: Metamodel): ConceptDeducer =>
    (node: Node) =>
        metamodel.elements.find((element) => element.simpleName === node.constructor.name) as Concept

