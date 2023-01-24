import {ModelAPI} from "../api.ts"
import {
    Concept,
    ConceptInterface,
    Containment,
    Enumeration,
    EnumerationLiteral,
    FeaturesContainer,
    Link,
    M3Concept,
    Metamodel,
    PrimitiveType,
    Property,
    Reference
} from "./types.ts"
import {lioncore, metaConcepts, metaFeatures} from "./self-definition.ts"
import {classBasedConceptDeducerFor} from "./functions.ts"


/**
 * An implementation of {@link ModelAPI} that works on instances of the LIonCore M3, so on M2s.
 */
export const lioncoreAPI: ModelAPI<M3Concept> = ({
    conceptOf: classBasedConceptDeducerFor(lioncore),
    nodeFor: (parent, conceptId, id, settings) => {
        switch (conceptId) {
            case metaConcepts.concept.id:
                return new Concept(parent as Metamodel, settings[metaFeatures.namespacedEntity_simpleName.id] as string, id, settings[metaFeatures.concept_abstract.id] as boolean)
            case metaConcepts.conceptInterface.id:
                return new ConceptInterface(parent as Metamodel, settings[metaFeatures.namespacedEntity_simpleName.id] as string, id)
            case metaConcepts.containment.id:
                return new Containment(parent as FeaturesContainer, settings[metaFeatures.namespacedEntity_simpleName.id] as string, id)
            case metaConcepts.enumeration.id:
                return new Enumeration(parent as Metamodel, settings[metaFeatures.namespacedEntity_simpleName.id] as string, id)
            case metaConcepts.enumerationLiteral.id:
                return new EnumerationLiteral(parent as Enumeration, settings[metaFeatures.metamodel_elements.id] as string, id)
            case metaConcepts.metamodel.id:
                return new Metamodel(settings[metaFeatures.metamodel_elements.id] as string, id)
            case metaConcepts.primitiveType.id:
                return new PrimitiveType(parent as Metamodel, settings[metaFeatures.namespacedEntity_simpleName.id] as string, id)
            case metaConcepts.property.id:
                return new Property(parent as FeaturesContainer, settings[metaFeatures.namespacedEntity_simpleName.id] as string, id)
            case metaConcepts.reference.id:
                return new Reference(parent as FeaturesContainer, settings[metaFeatures.namespacedEntity_simpleName.id] as string, id)
            default:
                throw new Error(`can't deserialize a node of concept with ID "${conceptId}"`)
        }
    },
    setFeatureValue: (node, feature, value) => {
        if (feature instanceof Property) {
            (node as any)[feature.simpleName] = value
        } else if (feature instanceof Link) {
            if (feature.multiple) {
                (node as any)[feature.simpleName].push(value)
            } else {
                (node as any)[feature.simpleName] = value
            }
        }
    },
    childrenOf: (node: M3Concept): M3Concept[] => {
        if (node instanceof Metamodel) {
            return node.elements
        }
        if (node instanceof FeaturesContainer) {
            return node.features
        }
        if (node instanceof Enumeration) {
            return node.literals
        }
        return []
    }
})

