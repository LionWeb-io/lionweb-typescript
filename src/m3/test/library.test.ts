import {
    assertEquals
} from "https://deno.land/std@0.168.0/testing/asserts.ts"

import {libraryMetamodel} from "./library.ts"
import {
    generatePlantUmlForMetamodel
} from "../diagrams/PlantUML-generator.ts"
import {serializeMetamodel} from "../serializer.ts"
import {readFileAsJson, writeJsonAsFile} from "../../utils/json.ts"


Deno.test("Library test model", async (tctx) => {

    await tctx.step("generate PlantUML diagram (no assertions)", async () => {
        const diagramText = generatePlantUmlForMetamodel(libraryMetamodel)
        await Deno.writeTextFileSync("diagrams/library-gen.puml", diagramText)
        assertEquals(diagramText, await Deno.readTextFileSync("diagrams/library-imported-from-ecore-gen.puml"))
    })

    await tctx.step("serialize it (no assertions)", async () => {
        const serialization = serializeMetamodel(libraryMetamodel)
        await writeJsonAsFile("models/library.json", serialization)
        assertEquals(serialization, await readFileAsJson("models/library-imported-from-ecore.json"))
    })

})

