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

        if (thing instanceof Concept) {
            json.push({
                type: metaConcepts.concept.id,
                id: thing.id,
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
            json.push({
                type: metaConcepts.conceptInterface.id,
                id: thing.id,
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
            json.push({
                type: metaConcepts.containment.id,
                id: thing.id,
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
            json.push({
                type: metaConcepts.enumeration.id,
                id: thing.id,
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
            json.push({
                type: metaConcepts.enumerationLiteral.id,
                id: thing.id,
                properties: {
                    [metaFeatures.namespacedEntity_simpleName.id]: thing.simpleName
                }
            })
            return
        }
        if (thing instanceof Metamodel) {
            json.push({
                type: metaConcepts.metamodel.id,
                id: thing.id,
                properties: {
                    [metaFeatures.metamodel_qualifiedName.id]: thing.qualifiedName
                },
                children: {
                    [metaFeatures.metamodel_elements.id]: asIds(thing.elements)
                }
            })
            thing.elements.forEach(visit)
            return
        }
        if (thing instanceof PrimitiveType) {
            json.push({
                type: metaConcepts.primitiveType.id,
                id: thing.id,
                properties: {
                    [metaFeatures.namespacedEntity_simpleName.id]: thing.simpleName
                }
            })
            return
        }
        if (thing instanceof Property) {
            json.push({
                type: metaConcepts.property.id,
                id: thing.id,
                properties: {
                    [metaFeatures.namespacedEntity_simpleName.id]: thing.simpleName,
                    [metaFeatures.feature_optional.id]: thing.optional,
                    [metaFeatures.feature_derived.id]: thing.derived,
                    [metaFeatures.property_disputed.id]: thing.disputed
                },
                references: {
                    [metaFeatures.property_type.id]: asRefIds(thing.type)
                }
            })
            return
        }
        if (thing instanceof Reference) {
            json.push({
                type: metaConcepts.reference.id,
                id: thing.id,
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

