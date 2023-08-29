import {assertEquals} from "./deps.ts"

import {serializeLanguage} from "../src/m3/serializer.ts"
import {deserializeLanguage} from "../src/m3/deserializer.ts"
import {Enumeration} from "../src/m3/types.ts"

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

