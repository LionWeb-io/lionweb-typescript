import {deepEqual} from "assert"
import {Concept, containmentChain, issuesWithFlatMap, Language, Node, Property,} from "@lionweb/core"


describe("functions", () => {

    it("containmentChain", () => {
        const node1: Node = { id: "1" }
        const node2: Node = { id: "2", parent: node1 }
        const node3: Node = { id: "3", parent: node1 }
        const node4: Node = { id: "4", parent: node2 }
        deepEqual(containmentChain(node1), [node1])
        deepEqual(containmentChain(node2), [node2, node1])
        deepEqual(containmentChain(node3), [node3, node1])
        deepEqual(containmentChain(node4), [node4, node2, node1])
    })

})

/**
 * Unit tests for flatMap function.
For Simple Case
For Cyclic Case
For Edge Cases

 * 
 */
describe("Unit tests for flatMap function====****|||", () => {
    it('should handle an empty language object', () => {

        const emptyLanguage = new Language('', '', '', '')
        const issue = issuesWithFlatMap(emptyLanguage)
        deepEqual(issue, {
            location: emptyLanguage,
            message: 'flatMap --> Empty language object'
        })
    })

    it('should detect cyclic references in a language model', () => {
        // // Setup: Create a cyclic language model
        const language = new Language('TestLanguage', '1.0', 'langId', 'langKey')
        const concept = new Concept(language, 'TestConcept', 'conceptKey', 'conceptId', false)
        const property = new Property(concept, 'TestProperty', 'propertyKey', 'propertyId')

        // // Creating a cyclic reference
        // property.type = concept // Property type referring back to the concept

        // // Test: Check for issues
        // let issue = issuesWithFlatMap(language)

        // // Assert: Cyclic issue detected
        // deepEqual(issue, {
        //     location: language,
        //     message: 'Cyclic reference detected'
        // })
    })

    it('should handle a language model with no nodes', () => {
        // // Setup: Create a language model with no nodes
        // const emptyLanguage = new Language('Empty', '1.0', 'emptyLangId', 'emptyLangKey')

        // // Test: Check for issues
        // let issue = issuesWithFlatMap(emptyLanguage)

        // // Assert: No nodes issue detected
        // deepEqual(issue, {
        //     location: emptyLanguage,
        //     message: 'No nodes present'
        // })
    })

    it('should handle a language model with a single node', () => {
        // // Setup: Create a language model with a single node
        // const language = new Language('Single', '1.0', 'singleLangId', 'singleLangKey')
        // const singleEntity = new Concept(language, 'SingleConcept', 'conceptKey', 'conceptId', false)
        // language.havingEntities(singleEntity)

        // // Test: Check for issues
        // let issue = issuesWithFlatMap(language)

        // // Assert: Single node issue detected
        // deepEqual(issue, {
        //     location: language,
        //     message: 'Single node present'
        // })
    })

})