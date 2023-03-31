import {assertEquals} from "../deps.ts"
import {lioncoreBuiltins} from "../../src/m3/builtins.ts"
import {serializeLanguage} from "../../src/m3/serializer.ts"
import {checkReferences} from "../../src/m3/reference-checker.ts"
import {issuesLanguage} from "../../src/m3/constraints.ts"
import {writeJsonAsFile} from "../utils/json.ts"
import {logIssues, logUnresolvedReferences} from "./test-helpers.ts"


Deno.test("primitive types built-in to LIonCore", async (tctx) => {

    await tctx.step("serialize it (no assertions)", async () => {
        const serialization = serializeLanguage(lioncoreBuiltins)
        await writeJsonAsFile("models/meta/builtins.json", serialization)
    })


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

