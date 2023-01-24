import {
    assertEquals
} from "https://deno.land/std@0.160.0/testing/asserts.ts"

import {lioncoreStdlib} from "../stdlib.ts"
import {serializeMetamodel} from "../serializer.ts"
import {checkReferences} from "../reference-checker.ts"
import {issuesMetamodel} from "../constraints.ts"
import {writeJsonAsFile} from "../../utils/json.ts"


Deno.test("stdlib (standard library) of built-in primitive types", async (tctx) => {

    await tctx.step("serialize it (no assertions)", async () => {
        const serialization = serializeMetamodel(lioncoreStdlib)
        await writeJsonAsFile("models/stdlib.json", serialization)
    })


    // TODO  find good way to DRY w.r.t. meta-circularity.test.ts:

    await tctx.step("check for unresolved references", () => {
        const unresolvedReferences = checkReferences(lioncoreStdlib)
        if (unresolvedReferences.length > 0) {
            console.error(`unresolved references:`)
            unresolvedReferences.forEach((location) => {
                console.error(`\t${location}`)
            })
        }
        assertEquals(unresolvedReferences.length, 0, "number of expected unresolved references -- see above for the locations")
    })

    await tctx.step("check constraints", () => {
        const issues = issuesMetamodel(lioncoreStdlib)
        if (issues.length > 0) {
            console.error(`constraint violations:`)
            issues.forEach(({message}) => {
                console.error(`\t${message}`)
            })
        }
        assertEquals(issues.length, 0, "number of expected constraint violations -- see above for the issues")
    })

})

