import {
    currentSerializationFormatVersion,
    LionWebId,
    LionWebJsonChunk,
    LionWebJsonNode,
    LionWebKey
} from "@lionweb/json"
import { byIdMap, groupBy, keepDefineds } from "@lionweb/ts-utils"
import { Writer } from "./writing.js"
import { defaultSimplisticHandler, SimplisticHandler } from "./handler.js"
import { BuiltinPropertyValueDeserializer } from "./m3/builtins.js"
import { MemoisingSymbolTable } from "./m3/symbol-table.js"
import { Classifier, Containment, Enumeration, Language, PrimitiveType, Property, Reference } from "./m3/types.js"
import { unresolved } from "./references.js"
import { Node } from "./types.js"

/**
 * Interface for objects that expose a method to deserialize a property's value.
 */
export interface PropertyValueDeserializer {
    deserializeValue(value: string | undefined, property: Property): unknown | undefined
}

/**
 * Misspelled alias of {@link PropertyValueDeserializer}, kept for backward compatibility, and to be deprecated and removed later.
 */
export interface PrimitiveTypeDeserializer extends PropertyValueDeserializer {}

/**
 * @return a deserialization of a {@link LionWebJsonChunk}
 *
 * @param serializationChunk - a {@link SerializedModel model} from its LionWeb serialization JSON format
 * @param writer - a {@link Writer} that is used to instantiate nodes and set values on them
 * @param languages - a {@link Language language} that the serialized model is expected to conform to
 * @param dependentNodes - a collection of nodes from dependent models against which all references in the serialized model are supposed to resolve against
 * @param propertyValueDeserializer - a deserializer for values of properties (by default a {@link BuiltinPropertyValueDeserializer})
 * @param problemHandler - a handler for reporting problems (by default a {@link defaultSimplisticHandler})
 */
export const deserializeSerializationChunk = <NT extends Node>(
    serializationChunk: LionWebJsonChunk,
    writer: Writer<NT>,
    languages: Language[],
    // TODO  facades <--> languages, so it's weird that it looks split up like this
    dependentNodes: Node[],
    // TODO (#13)  see if you can turn this into [nodes: Node[], writer: Writer<Node>][] after all
    propertyValueDeserializer: BuiltinPropertyValueDeserializer = new BuiltinPropertyValueDeserializer(),
    problemHandler: SimplisticHandler = defaultSimplisticHandler
): NT[] => {
    if (serializationChunk.serializationFormatVersion !== currentSerializationFormatVersion) {
        problemHandler.reportProblem(
            `can't deserialize from serialization format other than version "${currentSerializationFormatVersion}" - assuming that version`
        )
    }

    const symbolTable = new MemoisingSymbolTable(languages)

    const { nodes: serializedNodes } = serializationChunk

    const serializedNodeById = byIdMap(serializedNodes)

    const deserializedNodeById: { [id: LionWebId]: NT } = {}

    /**
     * Instantiates a {@link Node} from the given {@link LionWebJsonNode},
     * and stores it under its ID so references to it can be resolved.
     * For every serialized node, only one instance will ever be constructed (through memoisation).
     */
    const instantiateMemoised = (serNode: LionWebJsonNode, parent?: NT): NT | null => {
        if (serNode.id in deserializedNodeById) {
            return deserializedNodeById[serNode.id]
        }
        const node = instantiate(serNode, parent)
        if (node !== null) {
            deserializedNodeById[node.id] = node
        }
        return node
    }

    type ReferenceToInstall = [node: NT, feature: Reference, refId: LionWebId]
    const referencesToInstall: ReferenceToInstall[] = []

    const tryInstantiate = (
        parent: NT | undefined,
        classifier: Classifier,
        id: LionWebId,
        propertySettings: { [propertyKey: LionWebKey]: unknown }
    ): NT | null => {
        try {
            return writer.nodeFor(parent, classifier, id, propertySettings)
        } catch (e: unknown) {
            problemHandler.reportProblem(
                `error occurred during instantiation of a node for classifier ${classifier.name} with meta-pointer (${classifier.language.key}, ${classifier.language.version}, ${classifier.key}); reason:`
            )
            problemHandler.reportProblem((e as Error).toString())
            return null
        }
    }

    /**
     * Instantiates a {@link Node} from its {@link LionWebJsonNode serialization}.
     */
    const instantiate = (
        { id, classifier: classifierMetaPointer, properties, containments, references, annotations }: LionWebJsonNode,
        parent?: NT
    ): NT | null => {
        const classifier = symbolTable.entityMatching(classifierMetaPointer)

        if (classifier === undefined || !(classifier instanceof Classifier)) {
            problemHandler.reportProblem(
                `can't deserialize node with id=${id}: can't find the classifier with key ${classifierMetaPointer.key} in language (${classifierMetaPointer.language}, ${classifierMetaPointer.version})`
            )
            return null
        }

        const allFeatures = symbolTable.allFeaturesOfEntityMatching(classifierMetaPointer)

        const propertySettings: { [propertyKey: LionWebKey]: unknown } = {}

        const serializedPropertiesPerKey = properties === undefined ? {} : groupBy(properties, sp => sp.property.key) // (this assumes no duplicate keys among properties!)
        if (properties !== undefined) {
            allFeatures
                .filter(feature => feature instanceof Property)
                .map(feature => feature as Property)
                .forEach(property => {
                    if (property.key in serializedPropertiesPerKey) {
                        const value = serializedPropertiesPerKey[property.key][0].value
                        if (property.type instanceof PrimitiveType) {
                            propertySettings[property.key] =
                                value === null ? undefined : propertyValueDeserializer.deserializeValue(value, property as Property)
                            return
                        }
                        if (property.type instanceof Enumeration) {
                            const literal = property.type.literals.find(literal => literal.key === value)
                            if (literal !== undefined) {
                                propertySettings[property.key] = writer.encodingOf(literal)
                            }
                            return
                        }
                        // (property is not handled, because neither a primitive type nor of enumeration type)
                    }
                })
        }

        const node = tryInstantiate(parent, classifier, id, propertySettings)
        if (node === null) {
            return null
        }

        const serializedContainmentsPerKey = containments === undefined ? {} : groupBy(containments, sp => sp.containment.key) // (this assumes no duplicate keys among containments!)
        const serializedReferencesPerKey = references === undefined ? {} : groupBy(references, sp => sp.reference.key) // (this assumes no duplicate keys among references!)

        allFeatures.forEach(feature => {
            if (feature instanceof Property && properties !== undefined && feature.key in serializedPropertiesPerKey) {
                writer.setFeatureValue(node, feature, propertySettings[feature.key])
            } else if (feature instanceof Containment && containments !== undefined && feature.key in serializedContainmentsPerKey) {
                const childIds = serializedContainmentsPerKey[feature.key].flatMap(serChildren => serChildren.children) as LionWebId[]
                if (feature.multiple) {
                    childIds.forEach(childId => {
                        if (childId in serializedNodeById) {
                            writer.setFeatureValue(node, feature, instantiateMemoised(serializedNodeById[childId], node))
                        }
                    })
                } else {
                    if (childIds.length > 0) {
                        // just set the 1st one:
                        const firstChildId = childIds[0]
                        if (firstChildId in serializedNodeById) {
                            writer.setFeatureValue(node, feature, instantiateMemoised(serializedNodeById[firstChildId], node))
                        }
                    }
                }
            } else if (feature instanceof Reference && references !== undefined && feature.key in serializedReferencesPerKey) {
                const serRefs = (serializedReferencesPerKey[feature.key] ?? []).flatMap(serReferences =>
                    serReferences.targets.map(t => t.reference)
                )
                referencesToInstall.push(
                    ...(serRefs.filter(serRef => typeof serRef === "string") as LionWebId[]).map(
                        refId => [node, feature, refId] as ReferenceToInstall
                    )
                )
            }
        })

        node.annotations = keepDefineds(
            annotations
                .filter(annotationId => annotationId in serializedNodeById)
                .map(annotationId => instantiateMemoised(serializedNodeById[annotationId]))
        )
            .map(annotation => annotation!)

        return node
    }

    const rootLikeNodes = keepDefineds(
        serializedNodes
            .filter(({ parent }) => parent === null || !(parent in serializedNodeById))
            .map(serializedNode => instantiateMemoised(serializedNode))
    )
        .map(node => node!)

    const dependentNodesById = byIdMap(dependentNodes)

    referencesToInstall.forEach(([node, reference, refId]) => {
        const target = deserializedNodeById[refId] ?? dependentNodesById[refId]
        const value = (() => {
            if (target === undefined) {
                const metaTypeMessage = "concept" in node ? ` and (meta-)type ${node.concept}` : ""
                problemHandler.reportProblem(
                    `couldn't resolve the target with id=${refId} of a "${reference.name}" reference on the node with id=${node.id}${metaTypeMessage}`
                )
                return unresolved
            }
            return target
        })()
        writer.setFeatureValue(node, reference, value)
    })

    return rootLikeNodes
}

/**
 * Alias for {@link deserializeSerializationChunk}.
 */
export const deserializeChunk = deserializeSerializationChunk
