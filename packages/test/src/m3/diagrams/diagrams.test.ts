const {equal} = assert
import {assert} from "chai"
import {readFileSync, writeFileSync} from "fs"

import {
    builtinClassifiers,
    chain,
    concatenator,
    Language,
    LanguageFactory,
    lastOf
} from "@lionweb/core"
import {generateMermaidForLanguage, generatePlantUmlForLanguage, hasher} from "@lionweb/utilities"


const readTextFile = (fileName: string): string =>
    readFileSync(`src/m3/diagrams/${fileName}`, { encoding: "utf8" })

const writeTextFile = (fileName: string, data: string) => {
    writeFileSync(`src/m3/diagrams/${fileName}`, data, { encoding: "utf8" })
}

const rendersEqualToFileOrOverwrite = (renderer: (language: Language) => string, fileName: string) => {
    const actual = renderer(testLanguage)
    const expected = readTextFile(fileName)
    if (actual !== expected) {
        writeTextFile(fileName, actual)
    }
    equal(actual, expected)
}


const testLanguage = (() => {
    const factory = new LanguageFactory("test", "0", chain(concatenator("-"), hasher()), lastOf)

    const primitive1 = factory.primitiveType("CustomPrimitive")

    const concept1 = factory.concept("Concept1", false, builtinClassifiers.node)
    concept1.havingFeatures(
        factory.property(concept1, "prop1").isOptional().ofType(primitive1),
        factory.reference(concept1, "selfRefs").isMultiple().isOptional().ofType(concept1),
        factory.reference(concept1, "nodeTargets").ofType(builtinClassifiers.node)
    )
    const annotation1 = factory.annotation("Annotation1").annotating(builtinClassifiers.node)

    factory.language.havingEntities(primitive1, concept1, annotation1)

    return factory.language
})()


describe.only("rendering languages as PlantUML diagrams", () => {

    it("is improved", () => {
        rendersEqualToFileOrOverwrite(generatePlantUmlForLanguage, "test-diagram-expected.puml")
    })

})

describe.only("rendering languages as Mermaid diagrams", () => {

    it("is improved", () => {
        rendersEqualToFileOrOverwrite(generateMermaidForLanguage, "test-diagram-expected.md")
    })

})

