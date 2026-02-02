import { LanguageEntity, LanguageFactory, LionWebVersions } from "@lionweb/core"
import { chain, concatenator, lastOf } from "@lionweb/ts-utils"
import { DiagramRenderer, generateMermaidForLanguage, generatePlantUmlForLanguage, hasher } from "@lionweb/utilities"
import { readFileSync, writeFileSync } from "fs"
import { join } from "path"

import { equal } from "../../test-utils/assertions.js"

const diagramsPath = "src/utilities/diagrams"

const readTextFile = (fileName: string): string => readFileSync(join(diagramsPath, fileName), { encoding: "utf8" })

const writeTextFile = (fileName: string, data: string) => {
    writeFileSync(join(diagramsPath, fileName), data, { encoding: "utf8" })
}

const normalizeNewlines = (data: string): string =>
    data.replaceAll("\r\n", "\n") // normalize Windows EOLs

const rendersEqualToFileOrOverwrite = (renderer: DiagramRenderer, fileName: string, focusEntities?: LanguageEntity[]) => {
    const actual = normalizeNewlines(renderer(testLanguage, focusEntities))
    const expected = normalizeNewlines(readTextFile(fileName))
    if (actual !== expected) {
        writeTextFile(fileName, actual)
    }
    equal(actual, expected)
}

const testLanguage = (() => {
    const factory = new LanguageFactory("test", "0", chain(concatenator("-"), hasher()), lastOf)

    const primitive1 = factory.primitiveType("CustomPrimitive")

    const { node } = LionWebVersions.v2023_1.builtinsFacade.classifiers

    const concept1 = factory.concept("Concept1", false, node)
    factory.property(concept1, "prop1").isOptional().ofType(primitive1)
    factory.reference(concept1, "selfRefs").isMultiple().isOptional().ofType(concept1)
    factory.reference(concept1, "nodeTargets").ofType(node)

    const interface1 = factory.interface("Interface1")
    const annotation1 = factory.annotation("Annotation1").annotating(node)
    factory.annotation("Annotation2", annotation1).implementing(interface1)

    return factory.language
})()


describe("rendering languages as diagrams", () => {

    it("PlantUML", () => {
        rendersEqualToFileOrOverwrite(generatePlantUmlForLanguage, "test-diagram-expected.puml")
    })

    it("Mermaid", () => {
        rendersEqualToFileOrOverwrite(generateMermaidForLanguage, "test-diagram-expected.md")
    })

})


describe("focusing on specific entities", () => {

    it("0 entities", () => {
        rendersEqualToFileOrOverwrite(generatePlantUmlForLanguage, "empty-diagram-expected.puml", [])
        rendersEqualToFileOrOverwrite(generateMermaidForLanguage, "empty-diagram-expected.md", [])
    })

    it("2 entities in non-alphanumeric order", () => {
        const entity = (target: string) => testLanguage.entities.find(({name}) => name === target)!
        const annotations = ["Annotation2", "Annotation1"].map(entity)
        rendersEqualToFileOrOverwrite(generatePlantUmlForLanguage, "annotations-diagram-expected.puml", annotations)
        rendersEqualToFileOrOverwrite(generateMermaidForLanguage, "annotations-diagram-expected.md", annotations)
    })

})

