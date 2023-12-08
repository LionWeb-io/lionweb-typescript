import {asIds, Issue} from "@lionweb/core"


export const logUnresolvedReferences = (unresolvedReferences: string[]) => {
    if (unresolvedReferences.length > 0) {
        console.error(`unresolved references:`)
        unresolvedReferences.forEach((location) => {
            console.error(`\t${location}`)
        })
    }
}


export const logIssues = (issues: Issue[]) => {
    if (issues.length > 0) {
        console.error(`constraint violations:`)
        issues.forEach(({message, secondaries}) => {
            console.error(`\t${message}`)
            if (secondaries.length > 0 ) {
                console.error(`\t\tIDs of secondary locations: ${asIds(secondaries).join(", ")}`)
            }
        })
    }
}

