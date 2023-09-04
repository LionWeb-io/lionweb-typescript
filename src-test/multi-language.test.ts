import {assertEquals} from "./deps.ts"
import {undefinedValuesDeletedFrom} from "./utils/test-helpers.ts"
import {serializeNodes} from "../src/serializer.ts"
import {deserializeChunk} from "../src/deserializer.ts"
import {multiLanguage} from "./m3/multi-language.ts"
import {multiModel, multiModelApi} from "./multi.ts"
import {libraryLanguage} from "./m3/library-language.ts"


Deno.test("multi-language test model", async (tctx) => {

    await tctx.step("[de-]serialize multi-language model", () => {
        const serialization = serializeNodes(multiModel, multiModelApi)
        const deserialization = deserializeChunk(undefinedValuesDeletedFrom(serialization), multiModelApi, [libraryLanguage, multiLanguage], [])
        assertEquals(deserialization, multiModel)
    })
})

