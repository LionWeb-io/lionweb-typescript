import {assertEquals} from "../deps.ts"
import {libraryMetamodel} from "./library-meta.ts"
import {
    generatePlantUmlForMetamodel
} from "../../src/m3/diagrams/PlantUML-generator.ts"
import {generateMermaidForMetamodel} from "../../src/m3/diagrams/Mermaid-generator.ts"
import {serializeMetamodel} from "../../src/m3/serializer.ts"
import {deserializeMetamodel} from "../../src/m3/deserializer.ts"
import {lioncoreBuiltins} from "../../src/m3/builtins.ts"
import {writeJsonAsFile} from "../utils/json.ts"
import {schemaFor} from "../../src/m3/schema-generator.ts"
import {metaValidator} from "./json-validator.ts"
import {undefinedValuesDeletedFrom} from "./test-helpers.ts"


Deno.test("Library test metamodel", async (tctx) => {

    await tctx.step("LIonCore built-in primitive types are implicit", () => {
        libraryMetamodel.dependingOn(lioncoreBuiltins)
        assertEquals(libraryMetamodel.dependsOn, [])
    })

    await tctx.step("generate diagrams (no assertions)", async () => {
        const plantUmldiagramText = generatePlantUmlForMetamodel(libraryMetamodel)
        await Deno.writeTextFileSync("diagrams/library-gen.puml", plantUmldiagramText)
        const mermaidDiagramText = generateMermaidForMetamodel(libraryMetamodel)
        await Deno.writeTextFileSync("diagrams/library-gen.md", mermaidDiagramText)
    })

    await tctx.step("serialize it", async () => {
        const serialization = serializeMetamodel(libraryMetamodel)
        await writeJsonAsFile("models/meta/library.json", serialization)
        const deserialization = deserializeMetamodel(undefinedValuesDeletedFrom(serialization))
        assertEquals(deserialization, libraryMetamodel)
    })

    await tctx.step("generate JSON Schema for serialization format of libraries", async () => {
        const schema = schemaFor(libraryMetamodel)
        const metaErrors = metaValidator(schema)
        await writeJsonAsFile("schemas/library.serialization.schema.json", schema)
        assertEquals(metaErrors, [])
    })

})

