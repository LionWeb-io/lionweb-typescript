import {
    Annotation,
    ConceptInterface,
    Link,
    M3Concept,
    Metamodel
} from "./types.ts"
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
                            location: t as M3Concept,   // cast to coerce resulting signature of lambda
                            message: `The features of a ConceptInterface must all be derived, but the following feature${isPlural ? `s` : ``} of ${t.qualifiedName()} ${isPlural ? `are` : `is`} not: ${nonDerivedFeatures.map(({simpleName}) => simpleName).join(", ")}.`
                        }
                    ]
                }
            }
            if (t instanceof Link) {
                if (t.type instanceof Annotation) {
                    return [
                        {
                            location: t,
                            message: `An Annotation can't be the type of a ${t.constructor.name}, but the type of ${t.qualifiedName()} is ${t.type.qualifiedName()}.`
                        }
                    ]
                }
            }
            return []
        }
    )

