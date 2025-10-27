import {
    allContaineds,
    Concept,
    containmentChain,
    directlyContaineds,
    Enumeration,
    EnumerationLiteral,
    flatMap,
    Language,
    M3Concept,
    Node,
    Property
} from "@lionweb/core"
import { LionWebId } from "@lionweb/json"

import { metaLanguage } from "../languages/meta.js"
import { deepEqual, equal } from "../test-utils/assertions.js"

describe("containmentChain function", () => {
    const node = (id: LionWebId, parent?: Node): Node => ({
        id,
        annotations: [],
        parent
    })

    it("doesn't recurse infinitely on cycle", () => {
        const node1 = node("1")
        const node2 = node("2", node1)
        const node3 = node("3", node1)
        const node4 = node("4", node2)
        deepEqual(containmentChain(node1), [node1])
        deepEqual(containmentChain(node2), [node2, node1])
        deepEqual(containmentChain(node3), [node3, node1])
        deepEqual(containmentChain(node4), [node4, node2, node1])
    })
})

describe("flatMap function", () => {
    type Issue = {
        location: Language | M3Concept
        message: string
    }

    const issuesWithFlatMap = (language: Language): Issue => {
        const issues: Issue = {
            location: language,
            message: ""
        }
        const visited = new Set<M3Concept>()

        // check for an empty language object:
        if (isEmptyLanguage(language)) {
            return { ...issues, message: "flatMap --> empty language object" }
        }

        flatMap(language, (node: M3Concept): unknown[] => {
            // detect cyclic references:
            if (visited.has(node)) {
                if (!issues.message) issues.message = "flatMap --> cyclic reference detected"
                return []
            }
            visited.add(node)

            // additional logic can be added here for more constraints

            return []
        })

        handleEdgeCases(issues, visited)

        return issues
    }

    const isEmptyLanguage = (language: Language): boolean =>
        !language.id &&
        !language.key &&
        !language.name &&
        !language.version &&
        language.entities.length === 0 &&
        language.dependsOn.length === 0

    const handleEdgeCases = (issues: Issue, visited: Set<M3Concept>): void => {
        if (!issues.message && visited.size === 0) {
            issues.message = "No nodes present"
        } else if (!issues.message && visited.size === 1) {
            issues.message = "Single node present"
        }
    }

    it("should handle an empty language object", () => {
        const emptyLanguage = new Language("", "", "", "")
        const issue = issuesWithFlatMap(emptyLanguage)
        deepEqual(issue, {
            location: emptyLanguage,
            message: "flatMap --> empty language object"
        })
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
        const enumeration = new Enumeration(language, "ExampleEnumeration", "enum-001", "key-enum-001")
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

describe("meta-typed classifier deducer", () => {
    it("works for M3", () => {
        for (const thing of allContaineds(metaLanguage)) {
            equal(thing.metaType(), thing.constructor.name)
        }
    })
})

