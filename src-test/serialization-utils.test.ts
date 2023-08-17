import {shorten, sort} from "../src/serialization-utils.ts"
import {SerializedModel} from "../src/serialization.ts"
import {readFileAsJson, writeJsonAsFile} from "./utils/json.ts"
import {asText} from "../src/m3/textual-syntax.ts"
import {deserializeLanguage} from "../src/m3/deserializer.ts"


Deno.test("serialization utils", async (tctx) => {

    await tctx.step("shorten and &rarr;text LIonCore-{builtins + M3}", async () => {
        const shortenAndAsText = async (extlessPath: string) => {
            const json = await readFileAsJson(extlessPath + ".json") as SerializedModel
            const sortedJson = sort(json)
            await writeJsonAsFile(extlessPath + ".sorted.json", sortedJson)
            await writeJsonAsFile(extlessPath + ".short.json", shorten(sortedJson))
            await Deno.writeTextFile(extlessPath + ".txt", asText(deserializeLanguage(json)))
        }

        await shortenAndAsText("models/from_java/builtins")
        await shortenAndAsText("models/from_java/lioncore")
        await shortenAndAsText("models/meta/builtins")
        await shortenAndAsText("models/meta/lioncore")
    })

})

