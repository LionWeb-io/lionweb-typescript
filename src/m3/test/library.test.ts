import {assertEquals} from "../../deps.ts"
import {libraryMetamodel} from "./library-meta.ts"
import {
    generatePlantUmlForMetamodel
} from "../diagrams/PlantUML-generator.ts"
import {generateMermaidForMetamodel} from "../diagrams/Mermaid-generator.ts"
import {serializeMetamodel} from "../serializer.ts"
import {deserializeMetamodel} from "../deserializer.ts"
import {lioncoreBuiltins} from "../builtins.ts"
import {writeJsonAsFile} from "../../utils/json.ts"
import {schemaFor} from "../schema-generator.ts"
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

