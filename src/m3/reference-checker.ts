import {
    Concept,
    Containment,
    Metamodel,
    Property,
    Reference
} from "./types.ts"
import {flatMap} from "./functions.ts"
import {SingleRef, unresolved} from "../references.ts"


export const checkReferences = (metamodel: Metamodel): string[] =>
    flatMap(
        metamodel,
        (thing) => {

            const locations: string[] = []
            const check = (ref: SingleRef<any>, location: string) => {
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

