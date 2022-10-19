import {
    ConceptInterface,
    M3Concept,
    Metamodel,
    MetamodelElement
} from "./types.ts"

export type Issue = {
    location: M3Concept
    message: string
}


export const issuesMetamodel = (metamodel: Metamodel): Issue[] =>
    metamodel.elements.flatMap(issuesMetamodelElement)


const issuesMetamodelElement = (metamodelElement: MetamodelElement): Issue[] => {
    const issues: Issue[] = []
    if (metamodelElement instanceof ConceptInterface) {
        issues.push(...issuesConceptInterface(metamodelElement))
    }
    return issues
}

const issuesConceptInterface = (conceptInterface: ConceptInterface): Issue[] => {
    const issues: Issue[] = []
    const nonDerivedFeatures = conceptInterface.features.filter(({derived}) => !derived)    // TODO  use allFeatures()
    if (nonDerivedFeatures.length > 0) {
        const isPlural = nonDerivedFeatures.length > 1
        issues.push({
            location: conceptInterface,
            message: `The features of a ConceptInterface must all be derived, but the following feature${isPlural ? `s` : ``} of ${conceptInterface.name} ${isPlural ? `are` : `is`} not: ${nonDerivedFeatures.map(({name}) => name).join(", ")}.`
        })
    }
    return issues
}

