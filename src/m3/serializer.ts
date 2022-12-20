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


export const serialize = (metamodel: Metamodel): SerializedNode[] /* <=> JSON */ => {
    const json: SerializedNode[] = []

    const visit = (thing: M3Concept) => {

        if (thing instanceof Concept) {
            json.push({
                type: "Concept",
                id: thing.id,
                properties: {
                    simpleName: thing.simpleName,
                    abstract: thing.abstract
                },
                children: {
                    features: asIds(thing.features)
                },
                references: {
                    extends: asRefIds(thing.extends),
                    implements: asIds(thing.implements)
                }
            })
            thing.features.forEach(visit)
            return
        }
        if (thing instanceof ConceptInterface) {
            json.push({
                type: "ConceptInterface",
                id: thing.id,
                properties: {
                    simpleName: thing.simpleName
                },
                children: {
                    features: asIds(thing.features)
                },
                references: {
                    extends: asIds(thing.extends)
                }
            })
            thing.features.forEach(visit)
            return
        }
        if (thing instanceof Containment) {
            json.push({
                type: "Containment",
                id: thing.id,
                properties: {
                    simpleName: thing.simpleName,
                    optional: thing.optional,
                    derived: thing.derived,
                    multiple: thing.multiple
                },
                references: {
                    type: asRefIds(thing.type)
                }
            })
            return
        }
        if (thing instanceof Enumeration) {
            json.push({
                type: "Enumeration",
                id: thing.id,
                properties: {
                    simpleName: thing.simpleName
                },
                children: {
                    literals: asIds(thing.literals)
                }
            })
            thing.literals.forEach(visit)
            return
        }
        if (thing instanceof EnumerationLiteral) {
            json.push({
                type: "EnumerationLiteral",
                id: thing.id,
                properties: {
                    simpleName: thing.simpleName
                }
            })
            return
        }
        if (thing instanceof Metamodel) {
            json.push({
                type: "Metamodel",
                id: thing.id,
                properties: {
                    qualifiedName: thing.qualifiedName
                },
                children: {
                    elements: asIds(thing.elements)
                }
            })
            thing.elements.forEach(visit)
            return
        }
        if (thing instanceof PrimitiveType) {
            json.push({
                type: "PrimitiveType",
                id: thing.id,
                properties: {
                    simpleName: thing.simpleName
                }
            })
            return
        }
        if (thing instanceof Property) {
            json.push({
                type: "Property",
                id: thing.id,
                properties: {
                    simpleName: thing.simpleName,
                    optional: thing.optional,
                    derived: thing.derived,
                    disputed: thing.disputed
                },
                references: {
                    type: asRefIds(thing.type)
                }
            })
            return
        }
        if (thing instanceof Reference) {
            json.push({
                type: "Reference",
                id: thing.id,
                properties: {
                    simpleName: thing.simpleName,
                    optional: thing.optional,
                    derived: thing.derived,
                    multiple: thing.multiple
                },
                references: {
                    type: asRefIds(thing.type)
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

