import {Id, Node} from "./types.ts"
import {SerializedModel, SerializedNode} from "./serialization.ts"
import {ModelAPI} from "./api.ts"
import {
    Concept,
    Containment,
    Metamodel,
    Property,
    Reference
} from "./m3/types.ts"
import {allFeaturesOf} from "./m3/functions.ts"


/**
 * @return a map id -> thing with id.
 */
const byIdMap = <T extends { id: Id }>(ts: T[]): { [id: Id]: T } => {
    const map: { [id: Id]: T } = {}
    ts.forEach((t) => {
        map[t.id] = t
    })
    return map
}


/**
 * @return a deserialization of a serialized model
 *
 * @param serializedModel - a {@link SerializedModel model} from its LIonWeb serialization JSON format
 * @param modelAPI - a {@link ModelAPI model API} that is used to instantiate nodes and set values on them
 * @param metamodel - a {@link Metamodel metamodel} that the serialized model is expected to conform to
 * @param dependentNodes - a collection of nodes from dependent models against which all references in the serialized model are supposed to resolve against
 */
export const deserializeModel = <NT extends Node>(
    serializedModel: SerializedModel,
    modelAPI: ModelAPI<NT>,
    metamodel: Metamodel,
    dependentNodes: Node[]
    // TODO (#13)  see if you can turn this into [nodes: Node[], api: ModelAPI<Node>][] after all
): NT[] => {

    if (serializedModel.serializationFormatVersion !== 1) {
        throw new Error(`can't deserialize from format other than version 1`)
    }

    const { nodes: serializedNodes } = serializedModel

    const serializedRootNodes = serializedNodes.filter(({parent}) => parent === undefined)
    if (serializedRootNodes.length === 0) {
        throw new Error(`could not deserialize: no root nodes found`)
    }

    const serializedNodeById = byIdMap(serializedNodes)

    const deserializedNodeById: { [id: Id]: NT } = {}

    /**
     * Instantiates a {@link Node} from the given {@link SerializedNode},
     * and stores it under its ID so references to it can be resolved.
     * For every serialized node, only one instance will ever be constructed (through memoisation).
     */
    const instantiateMemoised = (serNode: SerializedNode, parent?: NT): NT => {
        if (serNode.id in deserializedNodeById) {
            return deserializedNodeById[serNode.id]
        }
        const node = instantiate(serNode, parent)
        deserializedNodeById[node.id] = node
        return node
    }

    type ReferenceToInstall = [node: NT, feature: Reference, refId: Id]
    const referencesToInstall: ReferenceToInstall[] = []

    /**
     * Instantiates a {@link Node} from its {@link SerializedNode serialization}.
     */
    const instantiate = ({concept: conceptId, id, properties, children, references}: SerializedNode, parent?: NT): NT => {

        const concept = metamodel.elements
            .find((element) =>
                element instanceof Concept && element.id === conceptId
            ) as (Concept | undefined)

        if (concept === undefined) {
            throw new Error(`can't deserialize a node having concept with ID "${conceptId}"`)
        }

        const allFeatures = allFeaturesOf(concept)

        const settings: { [propertyId: string]: any } = {}
        allFeatures
            .filter((feature) => feature instanceof Property)
            .forEach((property) => {
                settings[property.id] = properties![property.id]
            })

        const node = modelAPI.nodeFor(parent, concept, id, settings)

        allFeatures
            .filter((feature) => !feature.derived)
            .forEach((feature) => {
                if (feature instanceof Property) {
                    modelAPI.setFeatureValue(node, feature, properties![feature.id])
                } else if (feature instanceof Containment) {
                    if (feature.multiple) {
                        (children![feature.id])
                            .forEach((id) => {
                                modelAPI.setFeatureValue(node, feature, instantiateMemoised(serializedNodeById[id], node))
                            })
                    } else {
                        modelAPI.setFeatureValue(node, feature, instantiateMemoised(serializedNodeById[children![feature.id][0]], node))
                    }
                } else if (feature instanceof Reference) {
                    const serRefs = references![feature.id] ?? []
                    referencesToInstall.push(...(
                        (
                            serRefs
                                .filter((serRef) => typeof serRef === "string") as Id[]
                        )
                            .map((refId) => [node, feature, refId] as ReferenceToInstall)
                    ))
                }
            })

        return node

    }

    const rootNodes = serializedRootNodes.map((serializedRootNode) => instantiateMemoised(serializedRootNode))

    const nodesOfDependentModelsById = byIdMap(dependentNodes)

    referencesToInstall.forEach(([node, reference, refId]) => {
        const lookUpById = () => {
            const target = deserializedNodeById[refId] ?? nodesOfDependentModelsById[refId]
            if (target === undefined) {
                const metaTypeMessage = "concept" in node ? ` and (meta-)type ${node.concept}` : ""
                throw new Error(`couldn't find the target with id "${refId}" of a "${reference.simpleName}" reference on the node with id "${node.id}"${metaTypeMessage}`)
            }
            return target
        }
        modelAPI.setFeatureValue(node, reference, lookUpById())
    })

    return rootNodes
}

