import {assertEquals} from "./deps.ts"
import {deserializeLanguage, Enumeration, serializeLanguage} from "../src/index.ts"
import {languageWithEnum} from "./m3/language-with-enum.ts"


Deno.test("Language-with-enum test model", async (tctx) => {

    await tctx.step("roundtrip persistence of M2", () => {
        const serialization = serializeLanguage(languageWithEnum)
        const deserialization = deserializeLanguage(serialization)
        assertEquals(deserialization, languageWithEnum)
        const enum_ = deserialization.entities[0]
        assertEquals(enum_ instanceof Enumeration, true)
        assertEquals((enum_ as Enumeration).literals.length, 2)
    })

})

