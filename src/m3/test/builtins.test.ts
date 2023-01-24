import {
    assertEquals
} from "https://deno.land/std@0.160.0/testing/asserts.ts"

import {lioncoreBuiltins} from "../builtins.ts"
import {serializeMetamodel} from "../serializer.ts"
import {checkReferences} from "../reference-checker.ts"
import {issuesMetamodel} from "../constraints.ts"
import {writeJsonAsFile} from "../../utils/json.ts"


Deno.test("primitive types built-in to LIonCore", async (tctx) => {

    await tctx.step("serialize it (no assertions)", async () => {
        const serialization = serializeMetamodel(lioncoreBuiltins)
        await writeJsonAsFile("models/builtins.json", serialization)
    })


    // TODO  find good way to DRY w.r.t. meta-circularity.test.ts:

    await tctx.step("check for unresolved references", () => {
        const unresolvedReferences = checkReferences(lioncoreBuiltins)
        if (unresolvedReferences.length > 0) {
            console.error(`unresolved references:`)
            unresolvedReferences.forEach((location) => {
                console.error(`\t${location}`)
            })
        }
        assertEquals(unresolvedReferences.length, 0, "number of expected unresolved references -- see above for the locations")
    })

    await tctx.step("check constraints", () => {
        const issues = issuesMetamodel(lioncoreBuiltins)
        if (issues.length > 0) {
            console.error(`constraint violations:`)
            issues.forEach(({message}) => {
                console.error(`\t${message}`)
            })
        }
        assertEquals(issues.length, 0, "number of expected constraint violations -- see above for the issues")
    })

})

