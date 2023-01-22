import {Issue} from "../constraints.ts"


/**
 * Deletes all {@code undefined} values in objects hanging off of the given root.
 * This makes it possible to compare serializations before and after writing to disk,
 * because:
<pre>!assertEquals({ foo: undefined }, {})</pre>
 */
export const undefinedValuesDeletedFrom = (root: any) => {
    const visited: object[] = []

    const visit = (val: any) => {
        if (Array.isArray(val)) {
            val.forEach(visit)
        }

        if (typeof val !== "object") {
            return
        }

        const obj = val as object

        if (visited.indexOf(obj) > -1) {
            return obj
        }
        visited.push(obj)

        Object.entries(obj).forEach(([key, value]) => {
            if (value === undefined) {
                delete val[key]
            } else {
                visit(value)
            }
        })
    }

    visit(root)

    return root
}


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
        issues.forEach(({message}) => {
            console.error(`\t${message}`)
        })
    }
}

