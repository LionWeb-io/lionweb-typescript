import {assertEquals, AssertionError, assertThrows} from "../deps.ts"
import {undefinedValuesDeletedFrom} from "./test-helpers.ts"


Deno.test("test helpers", async (tctx) => {

    await tctx.step("undefinedValuesDeletedFrom is needed", () => {
        assertThrows(() => {
            assertEquals({foo: undefined}, {})
        },
            AssertionError
        )
    })

    await tctx.step("undefinedValuesDeletedFrom", () => {
        assertEquals(undefinedValuesDeletedFrom({ foo: undefined }), {} as any)
    })

})

