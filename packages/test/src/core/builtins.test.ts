import { checkReferences, issuesLanguage, LionWebVersions } from "@lionweb/core"

import { deepEqual } from "../test-utils/assertions.js"
import { logIssues, logUnresolvedReferences } from "../test-utils/test-helpers.js"


const lioncoreBuiltins = LionWebVersions.v2023_1.builtinsFacade.language

describe("primitive types built-in to LionCore", () => {
    it("check for unresolved references", () => {
        const unresolvedReferences = checkReferences(lioncoreBuiltins)
        logUnresolvedReferences(unresolvedReferences)
        deepEqual(unresolvedReferences, [], "number of expected unresolved references -- see above for the locations")
    })

    it("check constraints", () => {
        const issues = issuesLanguage(lioncoreBuiltins)
        logIssues(issues)
        deepEqual(issues, [], "number of expected constraint violations -- see above for the issues")
    })
})

