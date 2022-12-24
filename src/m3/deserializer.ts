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
import {
    concept,
    concept_abstract,
    concept_extends,
    concept_implements,
    conceptInterface,
    conceptInterface_extends,
    containment,
    feature_derived,
    feature_optional,
    featuresContainer_features,
    link_multiple,
    link_type,
    metamodel as metametamodel,
    metamodel_elements,
    metamodel_qualifiedName,
    namespacedEntity_simpleName,
    primitiveType,
    property,
    property_disputed,
    property_type,
    reference
} from "./self-definition.ts"


export const deserializeMetamodel = (serializedNodes: SerializedNode[]): Metamodel => {

    const metamodelSerNode = serializedNodes.find(({type}) => type === metametamodel.id)
    if (metamodelSerNode === undefined) {
        throw new Error(`could not deserialize: no instance of LIonCore's Metamodel concept found in serialization`)
    }

    // make a map id -> serialized node:
    const serializedNodeById: { [id: Id]: SerializedNode } = {}
    serializedNodes.forEach((node) => {
        serializedNodeById[node.id] = node
    })

    const deserializedNodeById: { [id: Id]: Node } = {}

    const constructMemoised = (serNode: SerializedNode, parent?: M3Concept): M3Concept => {
        const node = construct(serNode, parent)
        deserializedNodeById[node.id] = node
        return node
    }

    const mapConstructMemoised = <T extends Node>(parent: M3Concept) =>
        (id: Id): T =>
            constructMemoised(serializedNodeById[id], parent) as unknown as T

    const referencesToInstall: [node: Node, featureName: string, refId: Id][] = []

    const construct = ({type, id, properties, children, references}: SerializedNode, parent?: M3Concept): M3Concept => {
        switch (type) {
            case concept.id: {
                const {[namespacedEntity_simpleName.id]: simpleName, [concept_abstract.id]: abstract} = properties!
                const node = new Concept(parent as Metamodel, simpleName as string, id, abstract as boolean)
                const {[featuresContainer_features.id]: features} = children!
                node.havingFeatures(...features.map(mapConstructMemoised<Feature>(node)))
                const extends_ = references![concept_extends.id]
                if (extends_.length > 0 && typeof extends_[0] === "string") {
                    referencesToInstall.push([node, "extends", extends_[0]])
                }
                references![concept_implements.id].filter((serRef) => typeof serRef === "string").forEach((serRef) => {
                    referencesToInstall.push([node, "implements", serRef as Id])
                })
                return node
            }
            case conceptInterface.id: {
                const {[namespacedEntity_simpleName.id]: simpleName} = properties!
                const node = new ConceptInterface(parent as Metamodel, simpleName as string, id)
                const {[featuresContainer_features.id]: features} = children!
                node.havingFeatures(...features.map(mapConstructMemoised<Feature>(node)))
                references![conceptInterface_extends.id].filter((serRef) => typeof serRef === "string").forEach((serRef) => {
                    referencesToInstall.push([node, "extends", serRef as Id])
                })
                return node
            }
            case containment.id: {
                const {
                    [namespacedEntity_simpleName.id]: simpleName,
                    [feature_derived.id]: derived,
                    [feature_optional.id]: optional,
                    [link_multiple.id]: multiple
                } = properties!
                const node = new Containment(parent as FeaturesContainer, simpleName as string, id)
                node.derived = derived as boolean
                node.optional = optional as boolean
                node.multiple = multiple as boolean
                const {[link_type.id]: type} = references!
                referencesToInstall.push([node, "type", type[0] as Id])
                return node
            }
            case metametamodel.id: {
                const {[metamodel_qualifiedName.id]: qualifiedName} = properties!
                const node = new Metamodel(qualifiedName as string, id)
                const {[metamodel_elements.id]: elements} = children!
                node.havingElements(...elements.map(mapConstructMemoised<MetamodelElement>(node)))
                return node
            }
            case primitiveType.id: {
                const {[namespacedEntity_simpleName.id]: simpleName} = properties!
                const node = new PrimitiveType(parent as Metamodel, simpleName as string, id)
                return node
            }
            case property.id: {
                const {
                    [namespacedEntity_simpleName.id]: simpleName,
                    [feature_derived.id]: derived,
                    [feature_optional.id]: optional,
                    [property_disputed.id]: disputed
                } = properties!
                const node = new Property(parent as FeaturesContainer, simpleName as string, id)
                node.derived = derived as boolean
                node.optional = optional as boolean
                node.disputed = disputed as boolean
                const {[property_type.id]: type} = references!
                referencesToInstall.push([node, "type", type[0] as string])
                return node
            }
            case reference.id: {
                const {
                    [namespacedEntity_simpleName.id]: simpleName,
                    [feature_derived.id]: derived,
                    [feature_optional.id]: optional,
                    [link_multiple.id]: multiple
                } = properties!
                const node = new Reference(parent as FeaturesContainer, simpleName as string, id)
                node.derived = derived as boolean
                node.optional = optional as boolean
                node.multiple = multiple as boolean
                const {[link_type.id]: type} = references!
                referencesToInstall.push([node, "type", type[0] as string])
                return node
            }
            default: throw new Error(`can't deserialize a node of type "${type}"`)
        }
    }

    const metamodel = constructMemoised(metamodelSerNode) as Metamodel

    referencesToInstall.forEach(([node, featureName, refId]) => {
        if (node instanceof Concept) {
            switch (featureName) {
                case "extends": {
                    node.extends = deserializedNodeById[refId] as SingleRef<Concept>
                    break
                }
                case "implements": {
                    node.implements.push(deserializedNodeById[refId] as ConceptInterface)
                    break
                }
            }
        }
        if (node instanceof ConceptInterface) {
            switch (featureName) {
                case "extends": {
                    node.extends.push(deserializedNodeById[refId] as ConceptInterface)
                    break
                }
            }
        }
        if (node instanceof Link) {
            switch (featureName) {
                case "type": {
                    node.type = deserializedNodeById[refId] as SingleRef<FeaturesContainer>
                    break
                }
            }
        }
        if (node instanceof Property) {
            switch (featureName) {
                case "type": {
                    node.type = deserializedNodeById[refId] as SingleRef<Datatype>
                    break
                }
            }
        }
    })

    return metamodel
}

