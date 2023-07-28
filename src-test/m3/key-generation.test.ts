import {assertEquals} from "../deps.ts"
import {LanguageFactory} from "../../src/m3/factory.ts"
import {hashingIdGen} from "../../src/id-generation.ts"
import {qualifiedNameBasedKeyGenerator} from "../../src/m3/key-generation.ts"
import {intDatatype} from "../../src/m3/builtins.ts"


Deno.test("key generation", async (tctx) => {

    await tctx.step("based on qualified name", () => {
        const factory = new LanguageFactory("FormLanguage", "1", hashingIdGen(), qualifiedNameBasedKeyGenerator("-"))

        const form = factory.concept("Form", false)
        factory.language.havingEntities(form)

        assertEquals(form.key, "FormLanguage-Form")

        const size = factory.property(form, "size").ofType(intDatatype)
        form.havingFeatures(size)

        assertEquals(size.key, "FormLanguage-Form-size")
    })

})

