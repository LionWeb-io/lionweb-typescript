import {assertEquals} from "../../deps.ts"
import {lioncore} from "../self-definition.ts"
import {generateMermaidForMetamodel} from "../diagrams/Mermaid-generator.ts"
import {
    generatePlantUmlForMetamodel
} from "../diagrams/PlantUML-generator.ts"
import {checkReferences} from "../reference-checker.ts"
import {issuesMetamodel} from "../constraints.ts"
import {serializeMetamodel} from "../serializer.ts"
import {deserializeMetamodel} from "../deserializer.ts"
import {readFileAsJson, writeJsonAsFile} from "../../utils/json.ts"
import {
    createJsonValidatorForSchema,
    metaValidator
} from "./json-validator.ts"
import {SerializedModel} from "../../serialization.ts"
import {schemaFor} from "../schema-generator.ts"
import {
    logIssues,
    logUnresolvedReferences,
    undefinedValuesDeletedFrom
} from "./test-helpers.ts"


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
        const issues = issuesMetamodel(lioncore)
        logIssues(issues)
        assertEquals(issues, [], "number of expected constraint violations -- see above for the issues")
    })

    const serializedLioncorePath = "models/meta/lioncore.json"
    await tctx.step("serialize LIonCore (no assertions)", async () => {
        const serialization = serializeMetamodel(lioncore)
        await writeJsonAsFile(serializedLioncorePath, serialization)
    })

    await tctx.step("deserialize LIonCore", async () => {
        const serialization = await readFileAsJson(serializedLioncorePath) as SerializedModel
        const deserialization = deserializeMetamodel(undefinedValuesDeletedFrom(serialization))
        assertEquals(deserialization, lioncore)
    })

    await tctx.step("validate serialization of LIonCore", async () => {
        const serialization = serializeMetamodel(lioncore)
        const schema = await readFileAsJson("schemas/generic-serialization.schema.json")
        const metaErrors = metaValidator(schema)
        assertEquals(metaErrors, [])
        const serializationValidator = createJsonValidatorForSchema(schema)
        const errors = serializationValidator(serialization)
        assertEquals(errors, [])
    })

    await tctx.step("generate JSON Schema for serialization format of LIonCore/M3 instances", async () => {
        const schema = schemaFor(lioncore)
        const metaErrors = metaValidator(schema)
        assertEquals(metaErrors, [])
        await writeJsonAsFile("schemas/lioncore.serialization.schema.json", schema)
        const serialization = serializeMetamodel(lioncore)
        const validator = createJsonValidatorForSchema(schema)
        const errors = validator(serialization)
        assertEquals(errors, [])
    })

})

