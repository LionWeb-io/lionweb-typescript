import {assertEquals} from "../deps.ts"
import {Concept, issuesLanguage, Language, LanguageFactory} from "../../src/index.ts"


Deno.test("constraints (LIonCore)", async (tctx) => {

    await tctx.step("check that inheritance cycles are detected", () => {
        const factory = new LanguageFactory("metamodel", "1")
        const {language} = factory
        const cis = [0, 1, 2].map((i) => factory.conceptInterface(`conceptInterface ${i}`))
        cis[2].extends.push(cis[1])
        cis[1].extends.push(cis[0])
        cis[0].extends.push(cis[2])
        language.entities.push(...cis)

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
        language.entities.push(ci)

        const issues = issuesLanguage(language)
        assertEquals(issues.length, 1)
        const {location, message} = issues[0]
        assertEquals(location, ci)
        assertEquals(message, `A ConceptInterface can't inherit (directly or indirectly) from itself, but metamodel.foo does so through the following cycle: metamodel.foo -> metamodel.foo`)
    })

    await tctx.step("check that things have names", () => {
        const language = new Language("", "0", "x", "x")
        const concept = new Concept(language, "   ", "y", "y", false)
        language.havingEntities(concept)
        const issues = issuesLanguage(language)
        assertEquals(issues.length, 2)
        assertEquals(issues[0], {
            location: language,
            message: "A Language must have a non-whitespace name",
            secondaries: []
        })
        assertEquals(issues[1], {
            location: concept,
            message: "A Concept must have a non-whitespace name",
            secondaries: []
        })
    })

})

