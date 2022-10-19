import {
    assertEquals
} from "https://deno.land/std@0.160.0/testing/asserts.ts"

import {lioncore} from "./meta-circularity.ts"
import {generateForMetamodel} from "./PlantUML-generator.ts"
import {issuesMetamodel} from "./constraints.ts"


Deno.test("meta-circularity", async (tctx) => {
    await tctx.step("generate PlantUML -- no assertions", async () => {
        await Deno.writeTextFileSync("plantUML/metametamodel-gen.puml", generateForMetamodel(lioncore))
    })
    await tctx.step("check constraints", async () => {
        const issues = issuesMetamodel(lioncore)
        if (issues.length > 0) {
            console.error(`issues lioncore:`)
            issues.forEach(({message}) => {
                console.error(`\t${message}`)
            })
        }
        assertEquals(issues.length, 0, "number of expected issues -- see above for the issues")
    })
})


/*
 * TODOs:
 *
 *  0. [✓] rephrase as Deno tests
 *  1. [ ] check syntax
 *  2. […] check (some) constraints
 *  3. [ ] generate types.ts? (then: sort type def.s alphabetically)
 */

