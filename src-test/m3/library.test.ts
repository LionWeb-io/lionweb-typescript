import {assertEquals} from "../deps.ts"
import {libraryLanguage} from "./library-meta.ts"
import {
    generatePlantUmlForMetamodel
} from "../../src/m3/diagrams/PlantUML-generator.ts"
import {
    generateMermaidForMetamodel
} from "../../src/m3/diagrams/Mermaid-generator.ts"
import {serializeLanguage} from "../../src/m3/serializer.ts"
import {deserializeLanguage} from "../../src/m3/deserializer.ts"
import {lioncoreBuiltins} from "../../src/m3/builtins.ts"
import {writeJsonAsFile} from "../utils/json.ts"
import {undefinedValuesDeletedFrom} from "../utils/test-helpers.ts"


Deno.test("Library test metamodel", async (tctx) => {

    await tctx.step("LIonCore built-in primitive types are implicit", () => {
        libraryLanguage.dependingOn(lioncoreBuiltins)
        assertEquals(libraryLanguage.dependsOn, [])
    })

    await tctx.step("generate diagrams (no assertions)", async () => {
        const plantUmldiagramText = generatePlantUmlForMetamodel(libraryLanguage)
        await Deno.writeTextFileSync("diagrams/library-gen.puml", plantUmldiagramText)
        const mermaidDiagramText = generateMermaidForMetamodel(libraryLanguage)
        await Deno.writeTextFileSync("diagrams/library-gen.md", mermaidDiagramText)
    })

    await tctx.step("serialize it", async () => {
        const serialization = serializeLanguage(libraryLanguage)
        await writeJsonAsFile("models/meta/library.json", serialization)
        const deserialization = deserializeLanguage(undefinedValuesDeletedFrom(serialization))
        assertEquals(deserialization, libraryLanguage)
    })

})

