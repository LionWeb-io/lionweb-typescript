import {assertEquals} from "../deps.ts"

import {asText} from "../../src/m3/textual-syntax.ts"
import {languageWithEnum} from "./language-with-enum.ts"


Deno.test("textual syntax (LIonCore)", async (tctx) => {

    await tctx.step("print out language with an enum as text (no assertions)", async () => {
        assertEquals(
            asText(languageWithEnum),
`language language-with-enum
    version: 1
    entities (↓name):

        enumeration enum
            literals:
                lit1
                lit2

`
        )
    })

})

