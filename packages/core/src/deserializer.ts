import {Id, Node} from "./types.js"
import {currentSerializationFormatVersion, SerializationChunk, SerializedNode} from "./serialization.js"
import {InstantiationFacade} from "./facade.js"
import {NaiveSymbolTable} from "./symbol-table.js"
import {
    Classifier,
    Containment,
    Enumeration,
    Language,
    PrimitiveType,
    Property,
    Reference
} from "./m3/types.js"
import {allFeaturesOf} from "./m3/functions.js"
import {deserializeBuiltin} from "./m3/builtins.js"
import {groupBy} from "./utils/grouping.js"


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
 * @return a deserialization of a {@link SerializationChunk}
 *
 * @param serializationChunk - a {@link SerializedModel model} from its LionWeb serialization JSON format
 * @param instantiationFacade - a {@link InstantiationFacade} that is used to instantiate nodes and set values on them
 * @param languages - a {@link Language language} that the serialized model is expected to conform to
 * @param dependentNodes - a collection of nodes from dependent models against which all references in the serialized model are supposed to resolve against
 */
export const deserializeChunk = <NT extends Node>(
    serializationChunk: SerializationChunk,
    instantiationFacade: InstantiationFacade<NT>,
    languages: Language[],
    // TODO  facades <--> languages, so it's weird that it looks split up like this
    dependentNodes: Node[]
    // TODO (#13)  see if you can turn this into [nodes: Node[], instantiationFacade: InstantiationFacade<Node>][] after all
): NT[] => {

    if (serializationChunk.serializationFormatVersion !== currentSerializationFormatVersion) {
        throw new Error(`can't deserialize from serialization format other than version "${currentSerializationFormatVersion}"`)
    }

    const symbolTable = new NaiveSymbolTable(languages)

    const { nodes: serializedNodes } = serializationChunk

    const serializedRootNodes = serializedNodes.filter(({parent}) => parent === null)
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
    const instantiate = ({id, classifier: classifierMetaPointer, properties, containments, references, annotations}: SerializedNode, parent?: NT): NT => {

        const classifier = symbolTable.entityMatching(classifierMetaPointer)

        if (classifier === undefined || !(classifier instanceof Classifier)) {
            throw new Error(`can't deserialize a node having a classifier with key "${classifierMetaPointer.key}"`)
        }

        const allFeatures = allFeaturesOf(classifier)

        const propertySettings: { [propertyKey: string]: unknown } = {}

        const serializedPropertiesPerKey =
            properties === undefined ? {} : groupBy(properties, (sp) => sp.property.key)    // (this assumes no duplicate keys among properties!)
        if (properties !== undefined) {
            allFeatures
                .filter((feature) => feature instanceof Property)
                .map((feature) => feature as Property)
                .forEach((property) => {
                    if (property.key in serializedPropertiesPerKey) {
                        const value = serializedPropertiesPerKey[property.key][0].value
                        if (property.type instanceof PrimitiveType) {
                            propertySettings[property.key] = deserializeBuiltin(value, property as Property)
                            return
                        }
                        if (property.type instanceof Enumeration) {
                            const literal = property.type.literals.find((literal) => literal.key = value)
                            if (literal !== undefined) {
                                propertySettings[property.key] = instantiationFacade.encodingOf(literal)
                            }
                            return
                        }
                        // (property is not handled, because neither a primitive type nor of enumeration type)
                    }
                })
        }

        const node = instantiationFacade.nodeFor(parent, classifier, id, propertySettings)

        const serializedContainmentsPerKey =
            containments === undefined ? {} : groupBy(containments, (sp) => sp.containment.key)    // (this assumes no duplicate keys among containments!)
        const serializedReferencesPerKey =
            references === undefined ? {} : groupBy(references, (sp) => sp.reference.key)    // (this assumes no duplicate keys among references!)

        allFeatures
            .forEach((feature) => {
                if (feature instanceof Property && properties !== undefined && feature.key in serializedPropertiesPerKey) {
                    instantiationFacade.setFeatureValue(node, feature, propertySettings[feature.key])
                } else if (feature instanceof Containment && containments !== undefined && feature.key in serializedContainmentsPerKey) {
                    const childIds = serializedContainmentsPerKey[feature.key].flatMap((serChildren) => serChildren.children) as Id[]
                    if (feature.multiple) {
                        childIds
                            .forEach((childId) => {
                                instantiationFacade.setFeatureValue(node, feature, instantiateMemoised(serializedNodeById[childId], node))
                            })
                    } else {
                        if (childIds.length > 0) {
                            instantiationFacade.setFeatureValue(node, feature, instantiateMemoised(serializedNodeById[childIds[0]], node))  // (just set the 1st one)
                        }
                    }
                } else if (feature instanceof Reference && references !== undefined && feature.key in serializedReferencesPerKey) {
                    const serRefs = (serializedReferencesPerKey[feature.key] ?? []).flatMap(
                        (serReferences) => serReferences.targets.map(
                            (t) => t.reference)
                    )
                    referencesToInstall.push(...(
                        (
                            serRefs
                                .filter((serRef) => typeof serRef === "string") as Id[]
                        )
                            .map((refId) => [node, feature, refId] as ReferenceToInstall)
                    ))
                }
            })

        node.annotations = annotations.map((annotationId) => instantiateMemoised(serializedNodeById[annotationId]))

        return node

    }

    const rootNodes = serializedRootNodes.map((serializedRootNode) => instantiateMemoised(serializedRootNode))

    const nodesOfDependentModelsById = byIdMap(dependentNodes)

    referencesToInstall.forEach(([node, reference, refId]) => {
        const lookUpById = () => {
            const target = deserializedNodeById[refId] ?? nodesOfDependentModelsById[refId]
            if (target === undefined) {
                const metaTypeMessage = "concept" in node ? ` and (meta-)type ${node.concept}` : ""
                throw new Error(`couldn't find the target with id "${refId}" of a "${reference.name}" reference on the node with id "${node.id}"${metaTypeMessage}`)
            }
            return target
        }
        instantiationFacade.setFeatureValue(node, reference, lookUpById())
    })

    return rootNodes
}

