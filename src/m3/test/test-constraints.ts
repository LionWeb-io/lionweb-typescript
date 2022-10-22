import {
    assertEquals
} from "https://deno.land/std@0.160.0/testing/asserts.ts"

import {
    Annotation,
    Concept,
    ConceptInterface,
    Containment,
    Metamodel,
    Multiplicity,
    Property, Reference
} from "../types.ts"
import {issuesMetamodel} from "../constraints.ts"


Deno.test("constraints (lioncore)", async (tctx) => {

    await tctx.step("check that a ConceptInterface only has derived features", async () => {
        const metamodel = new Metamodel("metamodel")
        const conceptInterface = new ConceptInterface(metamodel, "conceptInterface")
        metamodel.havingElements(conceptInterface)
        const property = new Property(conceptInterface, "property", Multiplicity.Single)
        conceptInterface.havingFeatures(property)
        const issues = issuesMetamodel(metamodel)

        assertEquals(issues.length, 1)
        const {location, message} = issues[0]
        assertEquals(location, conceptInterface)
        assertEquals(message, `The features of a ConceptInterface must all be derived, but the following feature of metamodel.conceptInterface is not: property.`)
    })

    await tctx.step("check that an Annotation is not the type of a Containment", async () => {
        const metamodel = new Metamodel("metamodel")
        const annotation = new Annotation(metamodel, "@nnotation")
        const concept = new Concept(metamodel, "concept", false)
        const containment = new Containment(concept, "containment", Multiplicity.Optional)
            .ofType(annotation)
        concept.havingFeatures(containment)
        metamodel.havingElements(annotation, concept)
        const issues = issuesMetamodel(metamodel)

        assertEquals(issues.length, 1)
        const {location, message} = issues[0]
        assertEquals(location, containment)
        assertEquals(message, `An Annotation can't be the type of a Containment, but the type of metamodel.concept.containment is metamodel.@nnotation.`)
    })

    await tctx.step("check that an Annotation is not the type of a Reference", async () => {
        const metamodel = new Metamodel("metamodel")
        const annotation = new Annotation(metamodel, "@nnotation")
        const concept = new Concept(metamodel, "concept", false)
        const reference = new Reference(concept, "reference", Multiplicity.Optional)
            .ofType(annotation)
        concept.havingFeatures(reference)
        metamodel.havingElements(annotation, concept)
        const issues = issuesMetamodel(metamodel)

        assertEquals(issues.length, 1)
        const {location, message} = issues[0]
        assertEquals(location, reference)
        assertEquals(message, `An Annotation can't be the type of a Reference, but the type of metamodel.concept.reference is metamodel.@nnotation.`)
    })

})

