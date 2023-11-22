import {assert} from "chai"
const {deepEqual} = assert

import {
    checkReferences,
    deserializeLanguages,
    issuesLanguage,
    lioncore,
    serializeLanguages
} from "@lionweb/core"
import {asText} from "@lionweb/utilities"

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
        const serialization = serializeLanguages(lioncore)
        const deserialization = deserializeLanguages(serialization)
        deepEqual(deserialization.length, 1)
        const language = deserialization[0]
        deepEqual(asText(language), asText(lioncore))
        // deepEqual on object-level is not good enough (- maybe because of class JIT'ing?):
        // deepEqual(deserialization, lioncore)
            // TODO  implement proper equality/comparison
    })

})

