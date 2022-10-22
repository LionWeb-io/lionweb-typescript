import {ConceptInterface, M3Concept, Metamodel} from "./types.ts"
import {flatMap} from "./functions.ts"


export type Issue = {
    location: M3Concept
    message: string
}


export const issuesMetamodel = (metamodel: Metamodel): Issue[] =>
    flatMap(
        metamodel,
        (t) => {
            if (t instanceof ConceptInterface) {
                const nonDerivedFeatures = t.allFeatures().filter(({derived}) => !derived)
                if (nonDerivedFeatures.length > 0) {
                    const isPlural = nonDerivedFeatures.length > 1
                    return [
                        {
                            location: t,
                            message: `The features of a ConceptInterface must all be derived, but the following feature${isPlural ? `s` : ``} of ${t.simpleName} ${isPlural ? `are` : `is`} not: ${nonDerivedFeatures.map(({simpleName}) => simpleName).join(", ")}.`
                        }
                    ]
                }
            }
            return []
        }
    )

