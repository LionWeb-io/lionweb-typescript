import {Concept, ConceptInterface, Language, M3Concept} from "./types.ts"
import {flatMap, inheritedCycleWith} from "./functions.ts"


/**
 * Type definition for an issue corresponding
 * to a violation of a contraint on a {@link M3Concept language object}.
 */
export type Issue = {
    location: M3Concept
    message: string
}


/**
 * Computes the {@link Issue issues} (i.e., constraint violations) for the given language.
 * (This computation is resilient against e.g. inheritance cycles.)
 */
export const issuesLanguage = (language: Language): Issue[] =>
    flatMap(
        language,
        (t) => {

            const issues: Issue[] = []
            const issue = (message: string): void => {
                issues.push({
                    location: t,
                    message
                })
            }

            if (t instanceof Concept || t instanceof ConceptInterface) {
                const cycle = inheritedCycleWith(t)
                if (cycle.length > 0) {
                    issue(`A ${t.constructor.name} can't inherit (directly or indirectly) from itself, but ${t.qualifiedName()} does so through the following cycle: ${cycle.map((t) => t.qualifiedName()).join(" -> ")}`)
                }
            }

            if (t instanceof ConceptInterface) {
                const nonComputedFeatures = t.allFeatures().filter(({computed}) => !computed)
                if (nonComputedFeatures.length > 0) {
                    const isPlural = nonComputedFeatures.length > 1
                    issue(`The features of a ConceptInterface must all be computed, but the following feature${isPlural ? `s` : ``} of ${t.qualifiedName()} ${isPlural ? `are` : `is`} not: ${nonComputedFeatures.map(({name}) => name).join(", ")}.`)
                }
            }

            // TODO (#8)  add constraints on names
            // TODO (#8)  check uniqueness of IDs
            // TODO (#8)  check whether references are resolved (?)

            return issues
        }
    )

