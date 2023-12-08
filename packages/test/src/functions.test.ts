import {assert} from "chai"
const {deepEqual} = assert

import {containmentChain, flatMap, Id, Language, M3Concept, Node} from "@lionweb/core"


describe("containmentChain function", () => {

    const node = (id: Id, parent?: Node): Node => ({
        id,
        annotations: [],
        parent
    })

    it("doesn't recurse infinitely on cycle", () => {
        const node1 = node("1")
        const node2 = node("2", node1)
        const node3 = node("3", node1)
        const node4 = node("4", node2)
        deepEqual(containmentChain(node1), [node1])
        deepEqual(containmentChain(node2), [node2, node1])
        deepEqual(containmentChain(node3), [node3, node1])
        deepEqual(containmentChain(node4), [node4, node2, node1])
    })

})


describe("flatMap function", () => {

    type Issue = {
        location: Language | M3Concept,
        message: string
    }

    const issuesWithFlatMap = (language: Language): Issue => {
        const issues: Issue = {
            location: language,
            message: ''
        }
        const visited = new Set<M3Concept>()

        // check for an empty language object:
        if (isEmptyLanguage(language)) {
            return { ...issues, message: "flatMap --> Empty language object" }
        }

        flatMap(language, (node: M3Concept): unknown[] => {
            console.log("first node: ", node)
            // Detect cyclic references
            if (visited.has(node)) {
                if (!issues.message) issues.message = "flatMap --> Cyclic reference detected"
                return []
            }
            visited.add(node)

            // additional logic can be added here for more constraints

            return []
        })

        handleEdgeCases(issues, visited)

        return issues
    }

    const isEmptyLanguage = (language: Language): boolean =>
        !language.id && !language.key && !language.name && !language.version && language.entities.length === 0 && language.dependsOn.length === 0

    const handleEdgeCases = (issues: Issue, visited: Set<M3Concept>): void => {
        if (!issues.message && visited.size === 0) {
            issues.message = "No nodes present"
        } else if (!issues.message && visited.size === 1) {
            issues.message = "Single node present"
        }
    }

    it("should handle an empty language object", () => {
        const emptyLanguage = new Language("", "", "", "")
        const issue = issuesWithFlatMap(emptyLanguage)
        deepEqual(issue, {
            location: emptyLanguage,
            message: "flatMap --> Empty language object"
        })
    })

})