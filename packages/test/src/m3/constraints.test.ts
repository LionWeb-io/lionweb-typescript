import {assert} from "chai"
import {chain, concatenator, Concept, issuesLanguage, Language, LanguageFactory, lastOf} from "@lionweb/core"
import {nanoIdGen} from "@lionweb/utilities"

const {deepEqual} = assert


describe("constraints (LionCore)", () => {

    it("check that inheritance cycles are detected", () => {
        const factory = new LanguageFactory("metamodel", "1", chain(concatenator("-"), nanoIdGen()), lastOf)
        const {language} = factory
        const intfaces = [0, 1, 2].map((i) => factory.interface(`interface ${i}`))
        intfaces[2].extends.push(intfaces[1])
        intfaces[1].extends.push(intfaces[0])
        intfaces[0].extends.push(intfaces[2])
        language.entities.push(...intfaces)

        const issues = issuesLanguage(language)
        deepEqual(issues.length, 3)
        const message1 = issues?.find(({location}) => location === intfaces[0])?.message
        deepEqual(message1, `A Interface can't inherit (directly or indirectly) from itself, but metamodel.interface 0 does so through the following cycle: metamodel.interface 0 -> metamodel.interface 2 -> metamodel.interface 1 -> metamodel.interface 0`)
    })

    it("check that trivial inheritance cycles are detected", () => {
        const factory = new LanguageFactory("metamodel", "1", chain(concatenator("-"), nanoIdGen()), lastOf)
        const {language} = factory
        const intface = factory.interface(`foo`)
        intface.extends.push(intface)
        language.entities.push(intface)

        const issues = issuesLanguage(language)
        deepEqual(issues.length, 1)
        const {location, message} = issues[0]
        deepEqual(location, intface)
        deepEqual(message, `A Interface can't inherit (directly or indirectly) from itself, but metamodel.foo does so through the following cycle: metamodel.foo -> metamodel.foo`)
    })

    it("check that things have names", () => {
        const language = new Language("", "0", "x", "x")
        const concept = new Concept(language, "   ", "y", "y", false)
        language.havingEntities(concept)
        const issues = issuesLanguage(language)
        deepEqual(issues.length, 2)
        deepEqual(issues[0], {
            location: language,
            message: "A Language must have a non-whitespace name",
            secondaries: []
        })
        deepEqual(issues[1], {
            location: concept,
            message: "A Concept must have a non-whitespace name",
            secondaries: []
        })
    })

    it("check that version is empty", () => {
        const language = new Language("myLang", "", "x", "x")
        const issues = issuesLanguage(language)
        deepEqual(issues.length, 1)

        deepEqual(issues[0], {
            location: language,
            message: "A Language version must be a non-empty string",
            secondaries: [],
      })
    })
  
  
    it("check that version is non-empty", () => {
        const language = new Language("myLang", "version-name", "x", "x")
        const issues = issuesLanguage(language)
        deepEqual(issues.length, 0)
    })
})

