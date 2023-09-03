import {assertEquals} from "../deps.ts"
import {deserializeLanguage, lioncoreBuiltins, serializeLanguage} from "../../src/index.ts"
import {libraryLanguage} from "./library-language.ts"
import {undefinedValuesDeletedFrom} from "../utils/test-helpers.ts"


Deno.test("Library test metamodel", async (tctx) => {

    await tctx.step("LIonCore built-in primitive types are implicit", () => {
        libraryLanguage.dependingOn(lioncoreBuiltins)
        assertEquals(libraryLanguage.dependsOn, [])
    })

    await tctx.step("serialize it", () => {
        const serialization = serializeLanguage(libraryLanguage)
        const deserialization = deserializeLanguage(undefinedValuesDeletedFrom(serialization))
        assertEquals(deserialization, libraryLanguage)
    })

})

