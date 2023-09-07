import {assertEquals} from "../deps.ts"
import {builtinPrimitives, LanguageFactory, qualifiedNameBasedKeyGenerator} from "../../src/index.ts"
import {hashingIdGen} from "../../src-utils/id-generation.ts"


Deno.test("key generation", async (tctx) => {

    await tctx.step("based on qualified name", () => {
        const factory = new LanguageFactory("FormLanguage", "1", hashingIdGen(), qualifiedNameBasedKeyGenerator("-"))

        const form = factory.concept("Form", false)
        factory.language.havingEntities(form)

        assertEquals(form.key, "FormLanguage-Form")

        const size = factory.property(form, "size").ofType(builtinPrimitives.integerDatatype)
        form.havingFeatures(size)

        assertEquals(size.key, "FormLanguage-Form-size")
    })

})

