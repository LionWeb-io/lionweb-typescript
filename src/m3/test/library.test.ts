import {
    assertEquals
} from "https://deno.land/std@0.168.0/testing/asserts.ts"

import {libraryMetamodel} from "./library.ts"
import {
    generatePlantUmlForMetamodel
} from "../diagrams/PlantUML-generator.ts"
import {generateMermaidForMetamodel} from "../diagrams/Mermaid-generator.ts"
import {serializeMetamodel} from "../serializer.ts"
import {deserializeMetamodel} from "../deserializer.ts"
import {lioncoreBuiltins} from "../builtins.ts"
import {readFileAsJson, writeJsonAsFile} from "../../utils/json.ts"


Deno.test("Library test model", async (tctx) => {

    await tctx.step("generate PlantUML diagram", async () => {
        const diagramText = generatePlantUmlForMetamodel(libraryMetamodel)
        await Deno.writeTextFileSync("diagrams/library-gen.puml", diagramText)
        assertEquals(diagramText, await Deno.readTextFile("diagrams/library-imported-from-ecore-gen.puml"))
    })

    await tctx.step("generate Mermaid diagram", async () => {
        const diagramText = generateMermaidForMetamodel(libraryMetamodel)
        await Deno.writeTextFileSync("diagrams/library-gen.md", diagramText)
        assertEquals(diagramText, await Deno.readTextFile("diagrams/library-imported-from-ecore-gen.md"))
    })

    await tctx.step("serialize it", async () => {
        const serialization = serializeMetamodel(libraryMetamodel)
        await writeJsonAsFile("models/library.json", serialization)
        assertEquals(serialization, await readFileAsJson("models/library-imported-from-ecore.json"))
        const deserialization = deserializeMetamodel(serialization, lioncoreBuiltins)
        assertEquals(deserialization, libraryMetamodel)
    })

})

