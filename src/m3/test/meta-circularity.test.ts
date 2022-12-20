import {
    assertEquals
} from "https://deno.land/std@0.160.0/testing/asserts.ts"

import {lioncore} from "./self-definition.ts"
import {
    generatePlantUmlForMetamodel
} from "../diagrams/PlantUML-generator.ts"
import {checkReferences} from "../reference-checker.ts"
import {issuesMetamodel} from "../constraints.ts"
import {serialize} from "../serializer.ts"
import {deserialize} from "../deserializer.ts"
import {asPrettyString} from "../../utils/json.ts"


Deno.test("meta-circularity (LIonCore)", async (tctx) => {

    await tctx.step("generate PlantUML diagram (no assertions)", async () => {
        await Deno.writeTextFileSync("diagrams/metametamodel-gen.puml", generatePlantUmlForMetamodel(lioncore))
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

    const serializedLioncorePath = "models/lioncore.json"
    await tctx.step("serialize LIonCore (no assertions)", async () => {
        const serialization = serialize(lioncore)
        await Deno.writeTextFileSync(serializedLioncorePath, asPrettyString(serialization))
    })

    await tctx.step("deserialize LIonCore", async () => {
        const serialization = JSON.parse(Deno.readTextFileSync(serializedLioncorePath))
        const deserialization = deserialize(serialization)
        assertEquals(deserialization, lioncore)
    })

    // TODO  write unit tests re: (de-)serialization

})


/*
 * TODOs:
 *
 *  0. [✓] rephrase as Deno tests
 *  1. [✓] check references - only single-valued references can be unresolved
 *  2. […] check (some) constraints
 *  3. [ ] generate types.ts? (then: sort type def.s alphabetically)
 */

