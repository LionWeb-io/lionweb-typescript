import {readFileAsJson, writeJsonAsFile} from "./utils/json.ts"
import {assertJsonValidates, metaSchema} from "./utils/json-validator.ts"
import {lioncore} from "../src/m3/self-definition.ts"
import {schemaFor} from "../src/m3/schema-generator.ts"
import {Language} from "../src/m3/types.ts"
import {libraryLanguage} from "./m3/library-meta.ts"

/*
For JSON Schema validation:

1. meta-validate generic serialization schema separately
2. meta-validate all generated serialization schemas
3. validate all serializations (persisted &rarr; separately; in-test &rarr; on-the-fly)

 */

Deno.test("meta-validation of serialization JSON Schemas", async (tctx) => {

    await tctx.step("generic serialization JSON Schema", async () => {
        const schemaName = "generic"
        const schema = await readFileAsJson(`schemas/${schemaName}.serialization.schema.json`)
        await assertJsonValidates(schema, metaSchema, `schemas/${schemaName}.serialization.schema.errors.json`)
    })


    const metaValidateSchema = async (language: Language) => {
        const schema = schemaFor(language)
        const schemaName = language.name.toLowerCase()
        await writeJsonAsFile(`schemas/${schemaName}.serialization.schema.json`, schema)
        await assertJsonValidates(schema, metaSchema, `schemas/${schemaName}.serialization.schema.errors.json`)
    }

    await tctx.step("serialization JSON Schema generated for LIonCore/M3", async () => {
        await metaValidateSchema(lioncore)
    })

    await tctx.step("serialization JSON Schema generated for LIonCore/M3", async () => {
        await metaValidateSchema(libraryLanguage)
    })

})

