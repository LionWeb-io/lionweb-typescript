import { isValidIdKey } from '../utils/adhoc.js';
import { Classifier, isINamed, Language, M3Concept } from "./types.js"
import {containeds, flatMap, idOf, inheritedCycleWith, keyOf, namedsOf, qualifiedNameOf} from "./functions.js"
import {duplicatesAmong} from "../utils/grouping.js"


/**
 * Type definition for an issue corresponding
 * to a violation of a constraint on a {@link M3Concept language object}.
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

                // The name should not be non-empty string
                if(isINamed(t)) {
                    t.name.trim().length === 0 && issue(`A Language name must not be empty`)                   
                }

                // The name should not start with a number
                if (t instanceof Language) {
                    const name = t.name.trim()                
                    !isNaN(parseInt(name[0])) && issue(`A Language name cannot start with a number`)
                }

                // The version is a non-empty string
                if (t instanceof Language) {
                  const version = t.version.trim();
                  version.length === 0 && issue(`A Language version must be a non-empty string`)
                }

                // The name should not contain whitespace characters"
                if(isINamed(t)) {// //if (t instanceof Language) {
                    const name = t.name.trim()
                    name.includes(" ") && issue(`A Language name cannot contain whitespace characters`)
                }

                // The id consists only of latin characters (upper/lowercase), numbers, underscores, and hyphens
                if (t instanceof Language) {
                    const id = t.id.trim()
                    !isValidIdKey(id) && issue(`A Language ID must consist only of latin characters (upper/lowercase), numbers, underscores, and hyphens`)
                }

                // The key consists only of latin characters (upper/lowercase), numbers, underscores, and hyphens
                if (t instanceof Language) {
                    const key = t.key.trim()
                    !isValidIdKey(key) && issue(`A Language KEY must consist only of latin characters (upper/lowercase), numbers, underscores, and hyphens`)
                }

                // The classifier should not inherit from itself (directly or indirectly) // TODO
                if (t instanceof Classifier) {
                    const cycle = inheritedCycleWith(t)
                    if (cycle.length > 0) {
                        issue(`A ${t.constructor.name} can't inherit (directly or indirectly) from itself, but ${qualifiedNameOf(t)} does so through the following cycle: ${cycle.map((t) => qualifiedNameOf(t)).join(" -> ")}`)
                            // TODO  check whether it needs to be "a" or "an", or just say "An instance of ..."
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
        ...Object.entries(duplicatesAmong(containeds(language), idOf))
            .flatMap(
                ([id, ts]) => ts.map(
                    (t) => ({ location: t, message: `Multiple (nested) language elements with the same ID "${id}" exist in this language`, secondaries: ts.filter((otherT) => t !== otherT) })
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

