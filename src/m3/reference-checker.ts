import {
    Concept,
    Containment,
    Metamodel,
    Property,
    Reference,
    SingleRef,
    unresolved
} from "./types.ts"
import {flatMap} from "./functions.ts"


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
                check(thing.extends, `<Concept>${thing.name}#extends`)
            }
            if (thing instanceof Containment) {
                check(thing.type, `<Containment>${thing.name}#type`)
                    // TODO  add name of FeaturesContainer
            }
            if (thing instanceof Property) {
                check(thing.type, `<Property>${thing.name}#type`)
                    // TODO  add name of FeaturesContainer
            }
            if (thing instanceof Reference) {
                check(thing.type, `<Reference>${thing.name}#type`)
                    // TODO  add name of FeaturesContainer
            }

            return locations
        }
    )

