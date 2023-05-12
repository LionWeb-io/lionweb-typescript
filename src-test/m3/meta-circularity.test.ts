import {assertEquals} from "../deps.ts"
import {lioncore} from "../../src/m3/self-definition.ts"
import {
    generateMermaidForMetamodel
} from "../../src/m3/diagrams/Mermaid-generator.ts"
import {
    generatePlantUmlForMetamodel
} from "../../src/m3/diagrams/PlantUML-generator.ts"
import {checkReferences} from "../../src/m3/reference-checker.ts"
import {issuesLanguage} from "../../src/m3/constraints.ts"
import {serializeLanguage} from "../../src/m3/serializer.ts"
import {deserializeLanguage} from "../../src/m3/deserializer.ts"
import {readFileAsJson, writeJsonAsFile} from "../utils/json.ts"
import {assertJsonValidates, metaSchema} from "../utils/json-validator.ts"
import {SerializedModel} from "../../src/serialization.ts"
import {schemaFor} from "../../src/m3/schema-generator.ts"
import {
    logIssues,
    logUnresolvedReferences,
    undefinedValuesDeletedFrom
} from "../utils/test-helpers.ts"


Deno.test("meta-circularity (LIonCore)", async (tctx) => {

    await tctx.step("generate PlantUML and Mermaid diagrams (no assertions)", async () => {
        await Deno.writeTextFileSync("diagrams/metametamodel-gen.puml", generatePlantUmlForMetamodel(lioncore))
        await Deno.writeTextFileSync("diagrams/metametamodel-gen.md", generateMermaidForMetamodel(lioncore))
    })

    await tctx.step("check for unresolved references", () => {
        const unresolvedReferences = checkReferences(lioncore)
        logUnresolvedReferences(unresolvedReferences)
        assertEquals(unresolvedReferences, [], "number of expected unresolved references -- see above for the locations")
    })

    await tctx.step("check constraints", () => {
        const issues = issuesLanguage(lioncore)
        logIssues(issues)
        assertEquals(issues, [], "number of expected constraint violations -- see above for the issues")
    })

    const serializedLioncorePath = "models/meta/lioncore.json"
    await tctx.step("serialize LIonCore (no assertions)", async () => {
        const serialization = serializeLanguage(lioncore)
        await writeJsonAsFile(serializedLioncorePath, serialization)
    })

    await tctx.step("deserialize LIonCore", async () => {
        const serialization = await readFileAsJson(serializedLioncorePath) as SerializedModel
        const deserialization = deserializeLanguage(undefinedValuesDeletedFrom(serialization))
        assertEquals(deserialization, lioncore)
    })

    await tctx.step("validate serialization of LIonCore", async () => {
        const schema = await readFileAsJson("schemas/generic.serialization.schema.json")
        await assertJsonValidates(schema, metaSchema, "schemas/generic.serialization.schema.errors.json", "JSON Schema for generic serialization format")

        const serialization = serializeLanguage(lioncore)
        await assertJsonValidates(serialization, schema, "models/meta/lioncore.generic-serialization.errors.json")
    })

    await tctx.step("generate JSON Schema for serialization format of LIonCore/M3 instances", async () => {
        const schema = schemaFor(lioncore)
        await writeJsonAsFile("schemas/lioncore.serialization.schema.json", schema)
        await assertJsonValidates(schema, metaSchema, "schemas/lioncore.serialization.schema.errors.json", "JSON Schema specifically generated for serialization format of LIonCore (self-def.)")

        const serialization = serializeLanguage(lioncore)
        await assertJsonValidates(serialization, schema, "models/meta/lioncore.specific-serialization.errors.json", "serialization of LIonCore self-def.")
    })

})

