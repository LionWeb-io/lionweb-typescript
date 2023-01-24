import {
    Concept,
    ConceptInterface,
    Containment,
    Enumeration,
    EnumerationLiteral,
    M3Concept,
    Metamodel,
    PrimitiveType,
    Property,
    Reference
} from "./types.ts"
import {asIds} from "../types.ts"
import {asRefIds, SerializedNode} from "../serialization.ts"
import {metaConcepts, metaFeatures} from "./self-definition.ts"


/**
 * Serializes a metamodel (i.e., an instance of the LIonCore/M3 metametamodel,
 * using {@link M3Concept these type definitions})
 * into the LIonWeb serialization JSON format.
 */
export const serializeMetamodel = (metamodel: Metamodel): SerializedNode[] => {
    const json: SerializedNode[] = []

    const visit = (thing: M3Concept) => {

        const serializeNode = (metaConcept: Concept, settings: Pick<SerializedNode, "properties" | "children" | "references">) => {
            const serializedNode = {
                type: metaConcept.id,
                id: thing.id,
                ...settings,
                parent: thing.parent?.id
            }
            json.push(serializedNode)
            return serializedNode
        }
        if (thing instanceof Concept) {
            serializeNode(metaConcepts.concept, {
                properties: {
                    [metaFeatures.namespacedEntity_simpleName.id]: thing.simpleName,
                    [metaFeatures.concept_abstract.id]: thing.abstract
                },
                children: {
                    [metaFeatures.featuresContainer_features.id]: asIds(thing.features)
                },
                references: {
                    [metaFeatures.concept_extends.id]: asRefIds(thing.extends),
                    [metaFeatures.concept_implements.id]: asIds(thing.implements)
                }
            })
            thing.features.forEach(visit)
            return
        }
        if (thing instanceof ConceptInterface) {
            serializeNode(metaConcepts.conceptInterface, {
                properties: {
                    [metaFeatures.namespacedEntity_simpleName.id]: thing.simpleName
                },
                children: {
                    [metaFeatures.featuresContainer_features.id]: asIds(thing.features)
                },
                references: {
                    [metaFeatures.conceptInterface_extends.id]: asIds(thing.extends)
                }
            })
            thing.features.forEach(visit)
            return
        }
        if (thing instanceof Containment) {
            serializeNode(metaConcepts.containment, {
                properties: {
                    [metaFeatures.namespacedEntity_simpleName.id]: thing.simpleName,
                    [metaFeatures.feature_optional.id]: thing.optional,
                    [metaFeatures.feature_derived.id]: thing.derived,
                    [metaFeatures.link_multiple.id]: thing.multiple
                },
                references: {
                    [metaFeatures.link_type.id]: asRefIds(thing.type)
                }
            })
            return
        }
        if (thing instanceof Enumeration) {
            serializeNode(metaConcepts.enumeration, {
                properties: {
                    [metaFeatures.namespacedEntity_simpleName.id]: thing.simpleName
                },
                children: {
                    [metaFeatures.enumeration_literals.id]: asIds(thing.literals)
                }
            })
            thing.literals.forEach(visit)
            return
        }
        if (thing instanceof EnumerationLiteral) {
            serializeNode(metaConcepts.enumerationLiteral, {
                properties: {
                    [metaFeatures.namespacedEntity_simpleName.id]: thing.simpleName
                }
            })
            return
        }
        if (thing instanceof Metamodel) {
            serializeNode(metaConcepts.metamodel, {
                properties: {
                    [metaFeatures.metamodel_qualifiedName.id]: thing.qualifiedName
                },
                children: {
                    [metaFeatures.metamodel_elements.id]: asIds(thing.elements)
                },
                references: {
                    [metaFeatures.metamodel_dependsOn.id]: asIds(thing.dependsOn)
                }
            })
            thing.elements.forEach(visit)
            return
        }
        if (thing instanceof PrimitiveType) {
            serializeNode(metaConcepts.primitiveType, {
                properties: {
                    [metaFeatures.namespacedEntity_simpleName.id]: thing.simpleName
                }
            })
            return
        }
        if (thing instanceof Property) {
            serializeNode(metaConcepts.property, {
                properties: {
                    [metaFeatures.namespacedEntity_simpleName.id]: thing.simpleName,
                    [metaFeatures.feature_optional.id]: thing.optional,
                    [metaFeatures.feature_derived.id]: thing.derived,
                    [metaFeatures.property_programmatic.id]: thing.programmatic
                },
                references: {
                    [metaFeatures.property_type.id]: asRefIds(thing.type)
                }
            })
            return
        }
        if (thing instanceof Reference) {
            serializeNode(metaConcepts.reference, {
                properties: {
                    [metaFeatures.namespacedEntity_simpleName.id]: thing.simpleName,
                    [metaFeatures.feature_optional.id]: thing.optional,
                    [metaFeatures.feature_derived.id]: thing.derived,
                    [metaFeatures.link_multiple.id]: thing.multiple
                },
                references: {
                    [metaFeatures.link_type.id]: asRefIds(thing.type)
                }
            })
            return
        }

        // the following line produces a compiler error mentioning all types that have not been handled:
        const _noThing: never = thing
    }

    visit(metamodel)

    return json
}

