import {Concept, Containment, Language, Property, Reference} from "./types.js"
import {flatMap, qualifiedNameOf} from "./functions.js"
import {SingleRef, unresolved} from "../references.js"


/**
 * Checks whether the metamodel of the given language contains unresolved references.
 */
export const checkReferences = (language: Language): string[] =>
    flatMap(
        language,
        (thing) => {

            const locations: string[] = []
            const check = (ref: SingleRef<unknown>, location: string) => {
                if (ref === unresolved) {
                    locations.push(location)
                }
            }

            if (thing instanceof Concept) {
                check(thing.extends, `<Concept>${qualifiedNameOf(thing)}#extends`)
            }
            if (thing instanceof Containment) {
                check(thing.type, `<Containment>${qualifiedNameOf(thing)}#type`)
            }
            if (thing instanceof Property) {
                check(thing.type, `<Property>${qualifiedNameOf(thing)}#type`)
            }
            if (thing instanceof Reference) {
                check(thing.type, `<Reference>${qualifiedNameOf(thing)}#type`)
            }

            return locations
        }
    )
// TODO (#8)  make this generic, parametrized by a {@link Metamodel}

