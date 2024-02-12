const {deepEqual} = assert
import {assert} from "chai"
import {readFileSync} from "fs"

import {
    builtinClassifiers,
    chain,
    concatenator,
    LanguageFactory,
    lastOf
} from "@lionweb/core"
import {generateMermaidForLanguage, generatePlantUmlForLanguage, hasher} from "@lionweb/utilities"


const testLanguage = () => {
    const factory = new LanguageFactory("test", "0", chain(concatenator("-"), hasher()), lastOf)

    const primitive1 = factory.primitiveType("CustomPrimitive")

    const concept1 = factory.concept("Concept1", false, builtinClassifiers.node)
    concept1.havingFeatures(
        factory.property(concept1, "prop1").isOptional().ofType(primitive1),
        factory.reference(concept1, "refs").isMultiple().isOptional().ofType(concept1)
    )

    factory.language.havingEntities(primitive1, concept1)

    return factory.language
}


const readTextfile = (file: string): string =>
    readFileSync(`src/m3/diagrams/${file}`, { encoding: "utf8" })


describe.only("rendering languages as PlantUML diagrams", () => {

    it("is improved", () => {
        deepEqual(
            generatePlantUmlForLanguage(testLanguage()),
            readTextfile("test-diagram-expected.puml")
        )
    })

})


describe.only("rendering languages as Mermaid diagrams", () => {

    it("is improved", () => {
        deepEqual(
            generateMermaidForLanguage(testLanguage()),
            readTextfile("test-diagram-expected.md")
        )
    })

})

