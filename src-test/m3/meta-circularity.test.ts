import {assertEquals} from "../deps.ts"
import {
    asText,
    checkReferences,
    deserializeLanguage,
    issuesLanguage,
    lioncore,
    SerializationChunk
} from "../../src/index.ts"
import {readFileAsJson} from "../../src-utils/json.ts"
import {logIssues, logUnresolvedReferences} from "../utils/test-helpers.ts"
import {serializedLioncorePath} from "../../src-build/paths.ts"


Deno.test("meta-circularity (LIonCore)", async (tctx) => {

    await tctx.step("check for unresolved references", () => {
        const unresolvedReferences = checkReferences(lioncore)
        logUnresolvedReferences(unresolvedReferences)
        assertEquals(unresolvedReferences, [], "number of expected unresolved references -- see above for the locations")
    })

    await tctx.step("check constraints", () => {
        const issues = issuesLanguage(lioncore)
            // TODO  find out why computing issues is slow for a small language like LIonCore
        logIssues(issues)
        assertEquals(issues, [], "number of expected constraint violations -- see above for the issues")
    })

    await tctx.step("deserialize LIonCore", async () => {
        const serialization = await readFileAsJson(serializedLioncorePath) as SerializationChunk
        const deserialization = deserializeLanguage(serialization)
        assertEquals(asText(deserialization), asText(lioncore))
        // assertEquals on object-level is not good enouogh (- maybe because of class JIT'ing?):
        // assertEquals(deserialization, lioncore)
            // TODO  implement proper equality/comparison
    })

})

