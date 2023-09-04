import {assertEquals} from "./deps.ts"
import {undefinedValuesDeletedFrom} from "./utils/test-helpers.ts"
import {serializeNodes} from "../src/serializer.ts"
import {deserializeModel} from "../src/deserializer.ts"
import {libraryModel} from "./library.ts"
import {multiLanguage} from "./m3/multi-language.ts"
import {multiModel, multiModelApi} from "./multi.ts"


Deno.test("Library test model", async (tctx) => {

    await tctx.step("[de-]serialize multi-language model", () => {
        const serialization = serializeNodes(multiModel, multiModelApi)
        const deserialization = deserializeModel(undefinedValuesDeletedFrom(serialization), multiModelApi, multiLanguage, [])
        assertEquals(deserialization, libraryModel)
    })
})

