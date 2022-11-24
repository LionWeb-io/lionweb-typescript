import {
    Annotation,
    Concept,
    ConceptInterface,
    Link,
    M3Concept,
    Metamodel
} from "./types.ts"
import {flatMap, inheritedCycleWith} from "./functions.ts"


export type Issue = {
    location: M3Concept
    message: string
}


export const issuesMetamodel = (metamodel: Metamodel): Issue[] =>
    flatMap(
        metamodel,
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
                const nonDerivedFeatures = t.allFeatures().filter(({derived}) => !derived)
                if (nonDerivedFeatures.length > 0) {
                    const isPlural = nonDerivedFeatures.length > 1
                    issue(`The features of a ConceptInterface must all be derived, but the following feature${isPlural ? `s` : ``} of ${t.qualifiedName()} ${isPlural ? `are` : `is`} not: ${nonDerivedFeatures.map(({simpleName}) => simpleName).join(", ")}.`)
                }
            }

            if (t instanceof Link) {
                if (t.type instanceof Annotation) {
                    issue(`An Annotation can't be the type of a ${t.constructor.name}, but the type of ${t.qualifiedName()} is ${t.type.qualifiedName()}.`)
                }
            }

            return issues
        }
    )

