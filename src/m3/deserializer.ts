import {
    Concept,
    ConceptInterface,
    Containment,
    Datatype,
    Feature,
    FeaturesContainer,
    Link,
    M3Concept,
    Metamodel,
    MetamodelElement,
    PrimitiveType,
    Property,
    Reference
} from "./types.ts"
import {SingleRef} from "../references.ts"
import {Id, Node} from "../types.ts"
import {SerializedNode} from "../serialization.ts"
import {metaConcepts, metaFeatures} from "./self-definition.ts"


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
 * Deserializes a metamodel that's serialized into the LIonWeb serialization JSON format
 * as an instance of the LIonCore/M3 metametamodel, using {@link M3Concept these type definitions}.
 */
export const deserializeMetamodel = (serializedNodes: SerializedNode[], ...dependentMetamodels: Metamodel[]): Metamodel => {

    const metamodelSerNode = serializedNodes.find(({type}) => type === metaConcepts.metamodel.id)
    if (metamodelSerNode === undefined) {
        throw new Error(`could not deserialize: no instance of LIonCore's Metamodel concept found in serialization`)
    }

    const serializedNodeById = byIdMap(serializedNodes)

    const deserializedNodeById: { [id: Id]: Node } = {}

    /**
     * Instantiates a {@link Node} from the given {@link SerializedNode},
     * and stores it under its ID so references to it can be resolved.
     * For every serialized node, only one instance will ever be constructed (through memoisation).
     */
    const instantiateMemoised = (serNode: SerializedNode, parent?: M3Concept): M3Concept => {
        if (serNode.id in deserializedNodeById) {
            return deserializedNodeById[serNode.id] as M3Concept
        }
        const node = instantiate(serNode, parent)
        deserializedNodeById[node.id] = node
        return node
    }

    /**
     * @return a function that maps a {@link Node node's} ID to that node,
     * deserializing the node from its serialization.
     */
    const mapInstantiateMemoised = <T extends Node>(parent: M3Concept) =>
        (id: Id): T =>
            instantiateMemoised(serializedNodeById[id], parent) as unknown as T

    const referencesToInstall: [node: Node, featureName: string, refId: Id][] = []

    /**
     * Instantiates a {@link Node} from its {@link SerializedNode serialization}.
     */
    const instantiate = ({type, id, properties, children, references}: SerializedNode, parent?: M3Concept): M3Concept => {
        switch (type) {
            case metaConcepts.concept.id: {
                const {
                    [metaFeatures.namespacedEntity_simpleName.id]: simpleName,
                    [metaFeatures.concept_abstract.id]: abstract
                } = properties!
                const node = new Concept(parent as Metamodel, simpleName as string, id, abstract as boolean)
                const {
                    [metaFeatures.featuresContainer_features.id]: features
                } = children!
                node.havingFeatures(...features.map(mapInstantiateMemoised<Feature>(node)))
                const extends_ = references![metaFeatures.concept_extends.id]
                if (extends_.length > 0 && typeof extends_[0] === "string") {
                    referencesToInstall.push([node, "extends", extends_[0]])
                }
                references![metaFeatures.concept_implements.id]
                    .filter((serRef) => typeof serRef === "string")
                    .forEach((serRef) => {
                        referencesToInstall.push([node, "implements", serRef as Id])
                    })
                return node
            }
            case metaConcepts.conceptInterface.id: {
                const {
                    [metaFeatures.namespacedEntity_simpleName.id]: simpleName
                } = properties!
                const node = new ConceptInterface(parent as Metamodel, simpleName as string, id)
                const {
                    [metaFeatures.featuresContainer_features.id]: features
                } = children!
                node.havingFeatures(...features.map(mapInstantiateMemoised<Feature>(node)))
                references![metaFeatures.conceptInterface_extends.id]
                    .filter((serRef) => typeof serRef === "string")
                    .forEach((serRef) => {
                        referencesToInstall.push([node, "extends", serRef as Id])
                    })
                return node
            }
            case metaConcepts.containment.id: {
                const {
                    [metaFeatures.namespacedEntity_simpleName.id]: simpleName,
                    [metaFeatures.feature_derived.id]: derived,
                    [metaFeatures.feature_optional.id]: optional,
                    [metaFeatures.link_multiple.id]: multiple
                } = properties!
                const node = new Containment(parent as FeaturesContainer, simpleName as string, id)
                node.derived = derived as boolean
                node.optional = optional as boolean
                node.multiple = multiple as boolean
                const {
                    [metaFeatures.link_type.id]: type
                } = references!
                referencesToInstall.push([node, "type", type[0] as Id])
                return node
            }
            case metaConcepts.metamodel.id: {
                const {
                    [metaFeatures.metamodel_qualifiedName.id]: qualifiedName
                } = properties!
                const node = new Metamodel(qualifiedName as string, id)
                const {
                    [metaFeatures.metamodel_elements.id]: elements
                } = children!
                const {
                    [metaFeatures.metamodel_dependsOn.id]: dependingOn
                } = references!
                node.havingElements(...elements.map(mapInstantiateMemoised<MetamodelElement>(node)))
                    .dependingOn(
                        ...dependentMetamodels.filter((dependency) =>
                            dependingOn.some((dependsOn) => dependsOn as Id === dependency.id)
                        )
                    )
                return node
            }
            case metaConcepts.primitiveType.id: {
                const {
                    [metaFeatures.namespacedEntity_simpleName.id]: simpleName
                } = properties!
                // (ignore warning -- want to stick to the code pattern:)
                const node = new PrimitiveType(parent as Metamodel, simpleName as string, id)
                return node
            }
            case metaConcepts.property.id: {
                const {
                    [metaFeatures.namespacedEntity_simpleName.id]: simpleName,
                    [metaFeatures.feature_derived.id]: derived,
                    [metaFeatures.feature_optional.id]: optional,
                    [metaFeatures.property_programmatic.id]: programmatic
                } = properties!
                const node = new Property(parent as FeaturesContainer, simpleName as string, id)
                node.derived = derived as boolean
                node.optional = optional as boolean
                node.programmatic = programmatic as boolean
                const {
                    [metaFeatures.property_type.id]: type
                } = references!
                referencesToInstall.push([node, "type", type[0] as string])
                return node
            }
            case metaConcepts.reference.id: {
                const {
                    [metaFeatures.namespacedEntity_simpleName.id]: simpleName,
                    [metaFeatures.feature_derived.id]: derived,
                    [metaFeatures.feature_optional.id]: optional,
                    [metaFeatures.link_multiple.id]: multiple
                } = properties!
                const node = new Reference(parent as FeaturesContainer, simpleName as string, id)
                node.derived = derived as boolean
                node.optional = optional as boolean
                node.multiple = multiple as boolean
                const {
                    [metaFeatures.link_type.id]: type
                } = references!
                referencesToInstall.push([node, "type", type[0] as string])
                return node
            }
            default: throw new Error(`can't deserialize a node of type "${type}"`)
        }
    }

    const metamodel = instantiateMemoised(metamodelSerNode) as Metamodel

    const dependentMetamodelElementsById = byIdMap(dependentMetamodels.flatMap(({elements}) => elements))

    referencesToInstall.forEach(([node, featureName, refId]) => {
        const lookUpById = () => {
            const target = deserializedNodeById[refId] ?? dependentMetamodelElementsById[refId]
            if (target === undefined) {
                const metaTypeMessage = "type" in node ? ` and (meta-)type ${node.type}` : ""
                throw new Error(`couldn't find the target with id "${refId}" of a "${featureName}" reference on the node with id "${node.id}"${metaTypeMessage}`)
            }
            return target
        }
        if (node instanceof Concept) {
            switch (featureName) {
                case "extends": {
                    node.extends = lookUpById() as SingleRef<Concept>
                    break
                }
                case "implements": {
                    node.implements.push(lookUpById() as ConceptInterface)
                    break
                }
            }
        }
        if (node instanceof ConceptInterface) {
            switch (featureName) {
                case "extends": {
                    node.extends.push(lookUpById() as ConceptInterface)
                    break
                }
            }
        }
        if (node instanceof Link) {
            switch (featureName) {
                case "type": {
                    node.type = lookUpById() as SingleRef<FeaturesContainer>
                    break
                }
            }
        }
        if (node instanceof Property) {
            switch (featureName) {
                case "type": {
                    node.type = lookUpById() as SingleRef<Datatype>
                    break
                }
            }
        }
    })

    return metamodel
}

