import {assertEquals} from "../deps.ts"

import {lioncore} from "../../src/m3/lioncore.ts"
import {asText} from "../../src/m3/textual-syntax.ts"
import {lioncoreBuiltins} from "../../src/m3/builtins.ts"
import {libraryLanguage} from "./library-language.ts"
import {languageWithEnum} from "./language-with-enum.ts"
import {deserializeLanguage} from "../../src/m3/deserializer.ts"
import {readFileAsJson} from "../utils/json.ts"
import {SerializedModel} from "../../src/serialization.ts"


Deno.test("textual syntax (LIonCore)", async (tctx) => {

    await tctx.step("print out self-definition as text (no assertions)", async () => {
        await Deno.writeTextFile("models/meta/lioncore.txt", asText(lioncore))
    })

    await tctx.step("print out builtins as text (no assertions)", async () => {
        await Deno.writeTextFile("models/meta/builtins.txt", asText(lioncoreBuiltins))
    })

    await tctx.step("print out library language as text (no assertions)", async () => {
        await Deno.writeTextFile("models/meta/library.txt", asText(libraryLanguage))
    })

    await tctx.step("print out language with an enum as text (no assertions)", async () => {
        await Deno.writeTextFile("models/meta/language-with-enum.txt", asText(languageWithEnum))
    })

    await tctx.step("print out languages from Java, as text (no assertions)", async () => {
        const lioncoreFromJava = deserializeLanguage(await readFileAsJson("models/from_java/lioncore.json") as SerializedModel)
        assertEquals(lioncoreFromJava.name, "LIonCore.M3")
        await Deno.writeTextFile("models/from_java/lioncore.txt", asText(lioncoreFromJava))
    })

})

