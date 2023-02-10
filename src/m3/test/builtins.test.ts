import {
    assertEquals
} from "https://deno.land/std@0.160.0/testing/asserts.ts"

import {lioncoreBuiltins} from "../builtins.ts"
import {serializeMetamodel} from "../serializer.ts"
import {checkReferences} from "../reference-checker.ts"
import {issuesMetamodel} from "../constraints.ts"
import {writeJsonAsFile} from "../../utils/json.ts"
import {logIssues, logUnresolvedReferences} from "./test-helpers.ts"


Deno.test("primitive types built-in to LIonCore", async (tctx) => {

    await tctx.step("serialize it (no assertions)", async () => {
        const serialization = serializeMetamodel(lioncoreBuiltins)
        await writeJsonAsFile("models/meta/builtins.json", serialization)
    })


    await tctx.step("check for unresolved references", () => {
        const unresolvedReferences = checkReferences(lioncoreBuiltins)
        logUnresolvedReferences(unresolvedReferences)
        assertEquals(unresolvedReferences, [], "number of expected unresolved references -- see above for the locations")
    })

    await tctx.step("check constraints", () => {
        const issues = issuesMetamodel(lioncoreBuiltins)
        logIssues(issues)
        assertEquals(issues, [], "number of expected constraint violations -- see above for the issues")
    })

})

