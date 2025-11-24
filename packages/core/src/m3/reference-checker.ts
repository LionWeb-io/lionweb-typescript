import { SingleRef, unresolved } from "../references.js"
import { flatMap, qualifiedNameOf } from "./functions.js"
import { Concept, Containment, Language, Property, Reference } from "./types.js"
import { Node } from "../types.js"


/**
 * Checks whether the metamodel of the given language contains unresolved references.
 */
export const checkReferences = (language: Language): string[] =>
    flatMap(
        language,
        (thing) => {

            const locations: string[] = []
            const check = (location: string, ref?: SingleRef<Node>) => {
                if (ref === unresolved) {
                    locations.push(location)
                }
            }

            if (thing instanceof Concept) {
                check(`<Concept>${qualifiedNameOf(thing)}#extends`, thing.extends)
            }
            if (thing instanceof Containment) {
                check(`<Containment>${qualifiedNameOf(thing)}#type`, thing.type)
            }
            if (thing instanceof Property) {
                check(`<Property>${qualifiedNameOf(thing)}#type`, thing.type)
            }
            if (thing instanceof Reference) {
                check(`<Reference>${qualifiedNameOf(thing)}#type`, thing.type)
            }

            return locations
        }
    )
// TODO (#8)  make this generic, parametrized by a {@link Metamodel}

