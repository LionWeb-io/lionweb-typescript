import {assert} from "chai"
import {chain, concatenator, Concept, issuesLanguage, Language, LanguageFactory, lastOf} from "@lionweb/core"
import {nanoIdGen} from "@lionweb/utilities"

/**
 * Constraints (LionCore)
 *----------------------
 */


// ## General Constraints
// Constraints (LionCore)
describe("General Constraints - Name/Version" , () => {
    it("should (name) be non-empty", () => { 
        const language = new Language("", "0", "x", "x")
        const issues = issuesLanguage(language)
        deepEqual(issues.length, 1)
    })  
    
    it("should (name) not start with a number", () => { 
        const language = new Language("1myLang", "0", "x", "x")
        const issues = issuesLanguage(language)
        deepEqual(issues.length, 1)
    })    

    it("should (version) be non-empty", () => {
        const language = new Language("myLang", "", "x", "x")
        const issues = issuesLanguage(language)
        deepEqual(issues.length, 1)
    })

    it("should not contain whitespace characters", () => {
        const language = new Language("my Lang", "0", "x", "x")
        const issues = issuesLanguage(language)
        deepEqual(issues.length, 1)
     })

    it("should support Unicode characters, numbers, and underscores", () => { 
    const languageName = "myLang_123_𝟜𝟝𝟞";
    const language = new Language(languageName, "0", "x", "x");
    const issues = issuesLanguage(language);
        deepEqual(issues.length, 0)
    })
})

describe("Identifiers and Keys", () => {
    it("should be unique within its id-space", () => { })
    it("should consist only of latin characters (upper/lowercase), numbers, underscores, and hyphens", () => { })
    it("should be a globally unique identifier that also satisfies id constraints", () => { })
    it("should be identical and stable for built-in elements", () => { })
})

describe("Multiplicity", () => {
    it("should be a boolean flag indicating if link target is optional", () => { })
    it("should be a boolean flag indicating if multiple link targets are allowed", () => { })
})

// ## Language Constraints
describe("Language Constraints", () => {
    it("should (entities, concept,...) have names", () => {
        const language = new Language("", "0", "x", "x")
        const concept = new Concept(language, " my lang  ", "y", "y", false)
        language.havingEntities(concept)
        const issues = issuesLanguage(language)
        deepEqual(issues.length, 2)
        
        // console.log(issues)
        deepEqual(issues[0], {
            location: language,
            message: "A Language name must not be empty",
            secondaries: []
        })

        deepEqual(issues[1], {
            location: concept,
            message: "A Language name cannot contain whitespace characters",
            // message: "A Language name must not be empty",
            secondaries: []
        })
    })
})

// ## Element References
describe("Element References", () => {
    it("should reference elements within the same language", () => { })
    it("should reference elements within declared dependencies", () => { })
    it("should reference elements within transitive dependencies", () => { })
})

// ## Dependency Declaration
describe("Dependency Declaration", () => {
    it("should be an optional declaration for transitive and built-in dependencies", () => { })
})

// ## Concept Constraints
describe("Concept Constraints", () => {
    it("should not allow self-extension or circular extends", () => { })
    it("should have root nodes with the partition flag set to true", () => { })
    it("check that inheritance cycles are detected", () => {
        const factory = new LanguageFactory("metamodel", "1", nanoIdGen())
        const {language} = factory
        const cis = [0, 1, 2].map((i) => factory.interface(`interface_${i}`))
        cis[2].extends.push(cis[1])
        cis[1].extends.push(cis[0])
        cis[0].extends.push(cis[2])
        language.entities.push(...cis)

        const issues = issuesLanguage(language)
        // console.dir(issues, {depth: 3})
        console.log(issues)

        deepEqual(issues.length, 3)
        const message1 = issues?.find(({location}) => location === cis[0])?.message
        deepEqual(message1, `A Interface can't inherit (directly or indirectly) from itself, but metamodel.interface_0 does so through the following cycle: metamodel.interface_0 -> metamodel.interface_2 -> metamodel.interface_1 -> metamodel.interface_0`)
    })

    it("check that trivial inheritance cycles are detected", () => {
        const factory = new LanguageFactory("metamodel", "1", nanoIdGen())
        const {language} = factory
        const ci = factory.interface(`foo`)
        ci.extends.push(ci)
        language.entities.push(ci)

        const issues = issuesLanguage(language)
        deepEqual(issues.length, 1)
        const {location, message} = issues[0]
        deepEqual(location, ci)
        deepEqual(message, `A Interface can't inherit (directly or indirectly) from itself, but metamodel.foo does so through the following cycle: metamodel.foo -> metamodel.foo`)
    })
})

// ## Annotation Constraints
describe("Annotation Constraints", () => {
    it("should not allow multiple and annotates flags to be redefinable in sub-annotations", () => { })
    it("should be associated only with the concept types they are meant to annotate or their sub-concepts", () => { })
})

// ## Feature Constraints
describe("Feature Constraints", () => {
    it("should have feature names that are unique within their Classifier scope, including inherited features", () => { })
    it("should identify features by id or key in LionWeb in case of name clashes", () => { })
})

// ## Partition Constraints
describe("Partition Constraints", () => {
    it("should have each node exist in one partition, defined by its root node", () => { })
    it("should not allow partitions to be nested", () => { })
})

// ## Namespace Constraints
describe("Namespace Constraints", () => {
    it("should contain INamed descendants and enforce constraints like name uniqueness within the namespace and validity criteria for names", () => { })
})


