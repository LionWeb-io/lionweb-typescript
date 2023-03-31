import {assertEquals} from "../deps.ts"
import {LanguageFactory} from "../../src/m3/factory.ts"
import {issuesLanguage} from "../../src/m3/constraints.ts"


Deno.test("constraints (LIonCore)", async (tctx) => {

    await tctx.step("check that a ConceptInterface only has computed features", () => {
        const factory = new LanguageFactory("metamodel", "1")
        const {language} = factory
        const conceptInterface = factory.conceptInterface("conceptInterface")
        language.havingElements(conceptInterface)
        const property = factory.property(conceptInterface, "property")
        conceptInterface.havingFeatures(property)

        const issues = issuesLanguage(language)
        assertEquals(issues.length, 1)
        const {location, message} = issues[0]
        assertEquals(location, conceptInterface)
        assertEquals(message, `The features of a ConceptInterface must all be computed, but the following feature of metamodel.conceptInterface is not: property.`)
    })

    await tctx.step("check that inheritance cycles are detected", () => {
        const factory = new LanguageFactory("metamodel", "1")
        const {language} = factory
        const cis = [0, 1, 2].map((i) => factory.conceptInterface( `conceptInterface ${i}`))
        cis[2].extends.push(cis[1])
        cis[1].extends.push(cis[0])
        cis[0].extends.push(cis[2])
        language.elements.push(...cis)

        const issues = issuesLanguage(language)
        assertEquals(issues.length, 3)
        const message1 = issues?.find(({location}) => location === cis[0])?.message
        assertEquals(message1, `A ConceptInterface can't inherit (directly or indirectly) from itself, but metamodel.conceptInterface 0 does so through the following cycle: metamodel.conceptInterface 0 -> metamodel.conceptInterface 2 -> metamodel.conceptInterface 1 -> metamodel.conceptInterface 0`)
    })

    await tctx.step("check that trivial inheritance cycles are detected", () => {
        const factory = new LanguageFactory("metamodel", "1")
        const {language} = factory
        const ci = factory.conceptInterface(`foo`)
        ci.extends.push(ci)
        language.elements.push(ci)

        const issues = issuesLanguage(language)
        assertEquals(issues.length, 1)
        const {location, message} = issues[0]
        assertEquals(location, ci)
        assertEquals(message, `A ConceptInterface can't inherit (directly or indirectly) from itself, but metamodel.foo does so through the following cycle: metamodel.foo -> metamodel.foo`)
    })

})

