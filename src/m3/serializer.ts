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
import {
    concept,
    concept_abstract,
    concept_extends,
    concept_implements,
    conceptInterface,
    conceptInterface_extends,
    containment,
    enumeration,
    enumeration_literals,
    enumerationLiteral,
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


export const serializeMetamodel = (metamodel: Metamodel): SerializedNode[] /* <=> JSON */ => {
    const json: SerializedNode[] = []

    const visit = (thing: M3Concept) => {

        if (thing instanceof Concept) {
            json.push({
                type: concept.id,
                id: thing.id,
                properties: {
                    [namespacedEntity_simpleName.id]: thing.simpleName,
                    [concept_abstract.id]: thing.abstract
                },
                children: {
                    [featuresContainer_features.id]: asIds(thing.features)
                },
                references: {
                    [concept_extends.id]: asRefIds(thing.extends),
                    [concept_implements.id]: asIds(thing.implements)
                }
            })
            thing.features.forEach(visit)
            return
        }
        if (thing instanceof ConceptInterface) {
            json.push({
                type: conceptInterface.id,
                id: thing.id,
                properties: {
                    [namespacedEntity_simpleName.id]: thing.simpleName
                },
                children: {
                    [featuresContainer_features.id]: asIds(thing.features)
                },
                references: {
                    [conceptInterface_extends.id]: asIds(thing.extends)
                }
            })
            thing.features.forEach(visit)
            return
        }
        if (thing instanceof Containment) {
            json.push({
                type: containment.id,
                id: thing.id,
                properties: {
                    [namespacedEntity_simpleName.id]: thing.simpleName,
                    [feature_optional.id]: thing.optional,
                    [feature_derived.id]: thing.derived,
                    [link_multiple.id]: thing.multiple
                },
                references: {
                    [link_type.id]: asRefIds(thing.type)
                }
            })
            return
        }
        if (thing instanceof Enumeration) {
            json.push({
                type: enumeration.id,
                id: thing.id,
                properties: {
                    [namespacedEntity_simpleName.id]: thing.simpleName
                },
                children: {
                    [enumeration_literals.id]: asIds(thing.literals)
                }
            })
            thing.literals.forEach(visit)
            return
        }
        if (thing instanceof EnumerationLiteral) {
            json.push({
                type: enumerationLiteral.id,
                id: thing.id,
                properties: {
                    [namespacedEntity_simpleName.id]: thing.simpleName
                }
            })
            return
        }
        if (thing instanceof Metamodel) {
            json.push({
                type: metametamodel.id,
                id: thing.id,
                properties: {
                    [metamodel_qualifiedName.id]: thing.qualifiedName
                },
                children: {
                    [metamodel_elements.id]: asIds(thing.elements)
                }
            })
            thing.elements.forEach(visit)
            return
        }
        if (thing instanceof PrimitiveType) {
            json.push({
                type: primitiveType.id,
                id: thing.id,
                properties: {
                    [namespacedEntity_simpleName.id]: thing.simpleName
                }
            })
            return
        }
        if (thing instanceof Property) {
            json.push({
                type: property.id,
                id: thing.id,
                properties: {
                    [namespacedEntity_simpleName.id]: thing.simpleName,
                    [feature_optional.id]: thing.optional,
                    [feature_derived.id]: thing.derived,
                    [property_disputed.id]: thing.disputed
                },
                references: {
                    [property_type.id]: asRefIds(thing.type)
                }
            })
            return
        }
        if (thing instanceof Reference) {
            json.push({
                type: reference.id,
                id: thing.id,
                properties: {
                    [namespacedEntity_simpleName.id]: thing.simpleName,
                    [feature_optional.id]: thing.optional,
                    [feature_derived.id]: thing.derived,
                    [link_multiple.id]: thing.multiple
                },
                references: {
                    [link_type.id]: asRefIds(thing.type)
                }
            })
            return
        }

        // the following line produces a compiler error mentioning all types that have not been handled:
        const noThing: never = thing
    }

    visit(metamodel)

    return json
}

