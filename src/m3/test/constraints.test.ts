import {
    assertEquals
} from "https://deno.land/std@0.160.0/testing/asserts.ts"
import {nanoid} from "npm:nanoid@4.0.0"

import {ConceptInterface, Metamodel, Property} from "../types.ts"
import {issuesMetamodel} from "../constraints.ts"


Deno.test("constraints (lioncore)", async (tctx) => {

    await tctx.step("check that a ConceptInterface only has derived features", async () => {
        const metamodel = new Metamodel("metamodel", nanoid())
        const conceptInterface = new ConceptInterface(metamodel, "conceptInterface", nanoid())
        metamodel.havingElements(conceptInterface)
        const property = new Property(conceptInterface, "property", nanoid())
        conceptInterface.havingFeatures(property)

        const issues = issuesMetamodel(metamodel)
        assertEquals(issues.length, 1)
        const {location, message} = issues[0]
        assertEquals(location, conceptInterface)
        assertEquals(message, `The features of a ConceptInterface must all be derived, but the following feature of metamodel.conceptInterface is not: property.`)
    })

    await tctx.step("check that inheritance cycles are detected", async () => {
        const metamodel = new Metamodel("metamodel", nanoid())
        const cis = [0, 1, 2].map((i) => new ConceptInterface(metamodel, `conceptInterface ${i}`, nanoid()))
        cis[2].extends.push(cis[1])
        cis[1].extends.push(cis[0])
        cis[0].extends.push(cis[2])
        metamodel.elements.push(...cis)

        const issues = issuesMetamodel(metamodel)
        assertEquals(issues.length, 3)
        const message1 = issues?.find(({location}) => location === cis[0])?.message
        assertEquals(message1, `A ConceptInterface can't inherit (directly or indirectly) from itself, but metamodel.conceptInterface 0 does so through the following cycle: metamodel.conceptInterface 0 -> metamodel.conceptInterface 2 -> metamodel.conceptInterface 1 -> metamodel.conceptInterface 0`)
    })

    await tctx.step("check that trivial inheritance cycles are detected", async () => {
        const metamodel = new Metamodel("metamodel", nanoid())
        const ci = new ConceptInterface(metamodel, `foo`, nanoid())
        ci.extends.push(ci)
        metamodel.elements.push(ci)

        const issues = issuesMetamodel(metamodel)
        assertEquals(issues.length, 1)
        const {location, message} = issues[0]
        assertEquals(location, ci)
        assertEquals(message, `A ConceptInterface can't inherit (directly or indirectly) from itself, but metamodel.foo does so through the following cycle: metamodel.foo -> metamodel.foo`)
    })

})

