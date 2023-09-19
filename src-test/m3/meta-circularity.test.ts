import {assert} from "chai"
const {deepEqual} = assert

import {
    asText,
    checkReferences,
    deserializeLanguage,
    issuesLanguage,
    lioncore,
    SerializationChunk
} from "../../src-pkg/index.js"
import {readFileAsJson} from "../../src-utils/json.js"
import {logIssues, logUnresolvedReferences} from "../utils/test-helpers.js"
import {lioncorePath} from "../../src-build/paths.js"


describe("meta-circularity (LionCore)", () => {

    it("check for unresolved references", () => {
        const unresolvedReferences = checkReferences(lioncore)
        logUnresolvedReferences(unresolvedReferences)
        deepEqual(unresolvedReferences, [], "number of expected unresolved references -- see above for the locations")
    })

    it("check constraints", () => {
        const issues = issuesLanguage(lioncore)
            // TODO  find out why computing issues is slow for a small language like LionCore
        logIssues(issues)
        deepEqual(issues, [], "number of expected constraint violations -- see above for the issues")
    })

    it("deserialize LionCore", async () => {
        const serialization = await readFileAsJson(lioncorePath) as SerializationChunk
        const deserialization = deserializeLanguage(serialization)
        deepEqual(asText(deserialization), asText(lioncore))
        // deepEqual on object-level is not good enough (- maybe because of class JIT'ing?):
        // deepEqual(deserialization, lioncore)
            // TODO  implement proper equality/comparison
    })

})

