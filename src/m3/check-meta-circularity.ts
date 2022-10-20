import {
    assertEquals
} from "https://deno.land/std@0.160.0/testing/asserts.ts"

import {lioncore} from "./meta-circularity.ts"
import {generateForMetamodel} from "./PlantUML-generator.ts"
import {checkReferences} from "./reference-checker.ts"
import {issuesMetamodel} from "./constraints.ts"
import {Concept} from "./types.ts"


Deno.test("meta-circularity (lioncore)", async (tctx) => {

    await tctx.step("generate PlantUML (no assertions)", async () => {
        await Deno.writeTextFileSync("plantUML/metametamodel-gen.puml", generateForMetamodel(lioncore))
    })

    await tctx.step("check for unresolved references", async () => {
        const unresolvedReferences = checkReferences(lioncore)
        if (unresolvedReferences.length > 0) {
            console.error(`unresolved references:`)
            unresolvedReferences.forEach((location) => {
                console.error(`\t${location}`)
            })
        }
        assertEquals(unresolvedReferences.length, 0, "number of expected unresolved references -- see above for the locations")
    })

    await tctx.step("check constraints", async () => {
        const issues = issuesMetamodel(lioncore)
        if (issues.length > 0) {
            console.error(`constraint violations:`)
            issues.forEach(({message}) => {
                console.error(`\t${message}`)
            })
        }
        assertEquals(issues.length, 0, "number of expected constraint violations -- see above for the issues")
    })

    await tctx.step("derived feature FeaturesContainer#allFeatures on Annotation", async () => {
        const annotation = lioncore.elements.find((element) => element.simpleName === "Annotation") as Concept
        const allFeatures = annotation.allFeatures()
        assertEquals(
            allFeatures.map(({name}) => name).sort(),
            ["allFeatures", "container", "features", "platformSpecific", "qualifiedName", "simpleName", "target"],
            "allFeatures(Annotation)"
        )
    })

})


/*
 * TODOs:
 *
 *  0. [✓] rephrase as Deno tests
 *  1. [✓] check references - only single-valued references can be unresolved
 *  2. […] check (some) constraints
 *  3. [ ] generate types.ts? (then: sort type def.s alphabetically)
 */

