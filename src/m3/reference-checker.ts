import {
    Concept,
    Containment,
    Language,
    Property,
    Reference
} from "./types.ts"
import {flatMap} from "./functions.ts"
import {SingleRef, unresolved} from "../references.ts"


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
                check(thing.extends, `<Concept>${thing.qualifiedName()}#extends`)
            }
            if (thing instanceof Containment) {
                check(thing.type, `<Containment>${thing.qualifiedName()}#type`)
            }
            if (thing instanceof Property) {
                check(thing.type, `<Property>${thing.qualifiedName()}#type`)
            }
            if (thing instanceof Reference) {
                check(thing.type, `<Reference>${thing.qualifiedName()}#type`)
            }

            return locations
        }
    )
// TODO (#8)  make this generic, parametrized by a {@link Metamodel}

