import {libraryMetamodel} from "./library.ts"
import {
    generatePlantUmlForMetamodel
} from "../diagrams/PlantUML-generator.ts"
import {serializeMetamodel} from "../serializer.ts"
import {writeJsonAsFile} from "../../utils/json.ts"


Deno.test("Library test model", async (tctx) => {

    await tctx.step("generate PlantUML diagram (no assertions)", async () => {
        const diagramText = generatePlantUmlForMetamodel(libraryMetamodel)
        await Deno.writeTextFileSync("diagrams/library-gen.puml", diagramText)
    })

    await tctx.step("serialize it (no assertions)", async () => {
        const serialization = serializeMetamodel(libraryMetamodel)
        await writeJsonAsFile("models/library.json", serialization)
    })

})

