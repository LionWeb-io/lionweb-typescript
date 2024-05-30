import {Concept, Enumeration, EnumerationLiteral, Language, Property, directlyContaineds, flatMapNonCyclingFollowing, trivialFlatMapper} from "@lionweb/core"
import {deepEqual} from "assert"

describe("flatMapNonCyclingFollowing", () => {

    it("should return the root", () => {
        const thing = "thing"
        const flatMap = flatMapNonCyclingFollowing(trivialFlatMapper, _ => [])
        const result = flatMap(thing)

        deepEqual(result, [thing])
    })

    it("should detect not cycle indefinitely", () => {
        // set up a simple graph:
        const graph: {[node:number] : number[] }  = {
            1: [2, 3], // node 1 connects to 2 and 3
            2: [4],    // node 2 connects to 4
            3: [2],    // node 3 connects to 2 (creating a cycle with 1 -> 2 -> 3 -> 2)
            4: []      // node 4 is a leaf
        }   

        const flatMap = flatMapNonCyclingFollowing(trivialFlatMapper, (node: number) => graph[node])
        const result = flatMap(1)

        deepEqual(result, [1, 2, 4, 3])
    })

})


describe("directlyContaineds function", () => {

    it("should return entities for Language objects", () => {
        const language = new Language("ExampleLanguage", "1.0", "lang-001", "key-lang-001")
        const entity1 = new Concept(language, "Entity1", "key-entity-001", "id-entity-001", false)
        const entity2 = new Concept(language, "Entity2", "key-entity-002", "id-entity-002", false)
        language.havingEntities(entity1, entity2)

        const result = directlyContaineds(language)
        deepEqual(result, [entity1, entity2])

    })

    it("should return features for Classifier objects", () => {
        const language = new Language("ExampleLanguage", "1.0", "lang-001", "key-lang-001")
        const classifier = new Concept(language, "Classifier1", "key-class1", "class-001", false)
        const feature1 = new Property(classifier, "Feature1", "key-feat1", "feat-001")
        const feature2 = new Property(classifier, "Feature2", "key-feat2", "feat-002")
        classifier.havingFeatures(feature1, feature2)

        const result = directlyContaineds(classifier)
        deepEqual(result, [feature1, feature2])
    })

    it("should return literals for Enumeration objects", () => {
        const language = new Language("ExampleLanguage", "1.0", "lang-001", "key-lang-001")
        const enumeration = new Enumeration( language,"ExampleEnumeration", "enum-001", "key-enum-001")
        const literal1 = new EnumerationLiteral(enumeration, "Literal1", "key-lit1", "lit-001")
        const literal2 = new EnumerationLiteral(enumeration, "Literal2", "key-lit2", "lit-002")
        enumeration.havingLiterals(literal1, literal2)

        const result = directlyContaineds(enumeration)
        deepEqual(result, [literal1, literal2])
    })

    it("should return an empty array for non-matching M3Concepts", () => {
        const language = new Language("ExampleLanguage", "1.0", "lang-001", "key-lang-001")
        const classifier = new Concept(language, "Classifier1", "key-class1", "class-001", false)
        const nonMatchingConcept = new Property(classifier, "NonMatching", "key-nonmatch", "nonmatch-001")

        const result = directlyContaineds(nonMatchingConcept)
        deepEqual(result, [])
    })

})