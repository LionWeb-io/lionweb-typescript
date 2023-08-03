import {lioncore} from "../../src/m3/self-definition.ts"
import {asText} from "../../src/m3/textual-syntax.ts"
import {lioncoreBuiltins} from "../../src/m3/builtins.ts"
import {libraryLanguage} from "./library-language.ts"
import {languageWithEnum} from "./language-with-enum.ts"


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

})

