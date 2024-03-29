import {assert} from "chai"
const {deepEqual} = assert

import {lioncoreBuiltins} from "@lionweb/core"
import {checkReferences} from "@lionweb/core"
import {issuesLanguage} from "@lionweb/core"
import {logIssues, logUnresolvedReferences} from "../utils/test-helpers.js"


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

