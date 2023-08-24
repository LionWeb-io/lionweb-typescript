import {writeJsonAsFile} from "./utils/json.ts"
import {lioncore} from "../src/m3/lioncore.ts"
import {schemaFor} from "../src/m3/schema-generator.ts"
import {Language} from "../src/m3/types.ts"
import {libraryLanguage} from "./m3/library-language.ts"

/*
For JSON Schema validation:

1. meta-validate generic serialization schema separately
2. meta-validate all generated serialization schemas
3. validate all serializations (persisted &rarr; separately; in-test &rarr; on-the-fly)

 */

Deno.test("generate and persist serialization JSON Schemas", async (tctx) => {

    const persistSchemaFor = async (language: Language) => {
        const schema = schemaFor(language)
        const schemaName = language.name.toLowerCase()
        await writeJsonAsFile(`schemas/${schemaName}.serialization.schema.json`, schema)
    }

    await tctx.step("serialization JSON Schema generated for LIonCore/M3", async () => {
        await persistSchemaFor(lioncore)
    })

    await tctx.step("serialization JSON Schema generated for LIonCore/M3", async () => {
        await persistSchemaFor(libraryLanguage)
    })

})

