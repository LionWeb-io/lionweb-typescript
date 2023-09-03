import {assertEquals} from "../deps.ts"
import {lioncoreBuiltins} from "../../src/index.ts"
import {checkReferences} from "../../src/index.ts"
import {issuesLanguage} from "../../src/index.ts"
import {logIssues, logUnresolvedReferences} from "../utils/test-helpers.ts"


Deno.test("primitive types built-in to LIonCore", async (tctx) => {

    await tctx.step("check for unresolved references", () => {
        const unresolvedReferences = checkReferences(lioncoreBuiltins)
        logUnresolvedReferences(unresolvedReferences)
        assertEquals(unresolvedReferences, [], "number of expected unresolved references -- see above for the locations")
    })

    await tctx.step("check constraints", () => {
        const issues = issuesLanguage(lioncoreBuiltins)
        logIssues(issues)
        assertEquals(issues, [], "number of expected constraint violations -- see above for the issues")
    })

})

