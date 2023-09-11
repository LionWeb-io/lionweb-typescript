import {Concept, ConceptInterface, isINamed, Language, M3Concept} from "./types.js"
import {flatMap, inheritedCycleWith, keyOf, namedsOf, qualifiedNameOf} from "./functions.js"
import {duplicatesAmong} from "../utils/grouping.js"


/**
 * Type definition for an issue corresponding
 * to a violation of a contraint on a {@link M3Concept language object}.
 */
export type Issue = {
    location: M3Concept
    message: string
    secondaries: M3Concept[]
}
// TODO  back this type with an M2


/**
 * Computes the {@link Issue issues} (i.e., constraint violations) for the given language.
 * (This computation is resilient against e.g. inheritance cycles.)
 */
export const issuesLanguage = (language: Language): Issue[] =>
    [
        ...flatMap(
            language,
            (t) => {

                const issues: Issue[] = []
                const issue = (message: string, secondaries?: M3Concept[]): void => {
                    issues.push({
                        location: t,
                        message,
                        secondaries: secondaries ?? []
                    })
                }

                if (t instanceof Concept || t instanceof ConceptInterface) {
                    const cycle = inheritedCycleWith(t)
                    if (cycle.length > 0) {
                        issue(`A ${t.constructor.name} can't inherit (directly or indirectly) from itself, but ${qualifiedNameOf(t)} does so through the following cycle: ${cycle.map((t) => qualifiedNameOf(t)).join(" -> ")}`)
                    }
                }

                if (isINamed(t)) {
                    if (t.name.trim().length === 0) {
                        issue(`A ${t.constructor.name} must have a non-whitespace name`)
                    }
                }

                return issues
            }
        ),
        ...Object.entries(duplicatesAmong(namedsOf(language), keyOf))
            .flatMap(
                ([key, ts]) => ts.map(
                    (t) => ({ location: t, message: `Multiple (nested) language elements with the same key "${key}" exist in this language`, secondaries: ts.filter((otherT) => t !== otherT) })
                )
            ),
        ...Object.entries(duplicatesAmong(namedsOf(language), qualifiedNameOf))
            .flatMap(
                ([key, ts]) => ts.map(
                    (t) => ({ location: t, message: `Multiple (nested) language elements with the same key "${key}" exist in this language`, secondaries: ts.filter((otherT) => t !== otherT) })
                )
            )
    ]


// not here: duplicate IDs and unresolved references are a problem on a lower level
// TODO (#8)  check uniqueness of IDs
// TODO (#8)  check whether references are resolved

