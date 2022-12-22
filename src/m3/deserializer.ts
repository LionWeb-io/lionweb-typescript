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


export const deserializeMetamodel = (serializedNodes: SerializedNode[]): Metamodel => {

    const metamodelSerNode = serializedNodes.find(({type}) => type === "Metamodel")
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
            case "Concept": {
                const {simpleName, abstract} = properties!
                const node = new Concept(parent as Metamodel, simpleName as string, id, abstract as boolean)
                const {features} = children!
                node.havingFeatures(...features.map(mapConstructMemoised<Feature>(node)))
                const extends_ = references!["extends"]
                if (extends_.length > 0 && typeof extends_[0] === "string") {
                    referencesToInstall.push([node, "extends", extends_[0]])
                }
                references!["implements"].filter((serRef) => typeof serRef === "string").forEach((serRef) => {
                    referencesToInstall.push([node, "implements", serRef as Id])
                })
                return node
            }
            case "ConceptInterface": {
                const {simpleName} = properties!
                const node = new ConceptInterface(parent as Metamodel, simpleName as string, id)
                const {features} = children!
                node.havingFeatures(...features.map(mapConstructMemoised<Feature>(node)))
                references!["extends"].filter((serRef) => typeof serRef === "string").forEach((serRef) => {
                    referencesToInstall.push([node, "extends", serRef as Id])
                })
                return node
            }
            case "Containment": {
                const {simpleName, derived, optional, multiple} = properties!
                const node = new Containment(parent as FeaturesContainer, simpleName as string, id)
                node.derived = derived as boolean
                node.optional = optional as boolean
                node.multiple = multiple as boolean
                const {type} = references!
                referencesToInstall.push([node, "type", type[0] as Id])
                return node
            }
            case "Metamodel": {
                const {qualifiedName} = properties!
                const node = new Metamodel(qualifiedName as string, id)
                const {elements} = children!
                node.havingElements(...elements.map(mapConstructMemoised<MetamodelElement>(node)))
                return node
            }
            case "PrimitiveType": {
                const {simpleName} = properties!
                const node = new PrimitiveType(parent as Metamodel, simpleName as string, id)
                return node
            }
            case "Property": {
                const {simpleName, derived, optional, disputed} = properties!
                const node = new Property(parent as FeaturesContainer, simpleName as string, id)
                node.derived = derived as boolean
                node.optional = optional as boolean
                node.disputed = disputed as boolean
                const {type} = references!
                referencesToInstall.push([node, "type", type[0] as string])
                return node
            }
            case "Reference": {
                const {simpleName, derived, optional, multiple} = properties!
                const node = new Reference(parent as FeaturesContainer, simpleName as string, id)
                node.derived = derived as boolean
                node.optional = optional as boolean
                node.multiple = multiple as boolean
                const {type} = references!
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

