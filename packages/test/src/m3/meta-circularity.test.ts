import {assert} from "chai"
const {deepEqual} = assert

import {
    asText,
    checkReferences,
    deserializeLanguage,
    issuesLanguage,
    lioncore,
    serializeLanguage
} from "@lionweb/core"
import {logIssues, logUnresolvedReferences} from "../utils/test-helpers.js"


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
        const serialization = serializeLanguage(lioncore)
        const deserialization = deserializeLanguage(serialization)
        deepEqual(asText(deserialization), asText(lioncore))
        // deepEqual on object-level is not good enough (- maybe because of class JIT'ing?):
        // deepEqual(deserialization, lioncore)
            // TODO  implement proper equality/comparison
    })

})

