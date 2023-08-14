import {shorten} from "../src/serialization-utils.ts"
import {SerializedModel} from "../src/serialization.ts"
import {readFileAsJson, writeJsonAsFile} from "./utils/json.ts"
import {asText} from "../src/m3/textual-syntax.ts"
import {deserializeLanguage} from "../src/m3/deserializer.ts"


Deno.test("serialization utils", async (tctx) => {

    await tctx.step("shorten", async () => {
        const builtinsJson = await readFileAsJson("models/from_java/builtins.json") as SerializedModel
        await writeJsonAsFile("models/from_java/builtins.short.json", shorten(builtinsJson))
        await Deno.writeTextFile("models/from_java/builtins.txt", asText(deserializeLanguage(builtinsJson)))

        await writeJsonAsFile("models/from_java/lioncore.short.json", shorten(
            await readFileAsJson("models/from_java/lioncore.json") as SerializedModel
        ))
    })

})

