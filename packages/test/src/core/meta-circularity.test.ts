import {
    checkReferences,
    deserializeLanguages,
    issuesLanguage,
    LionWebVersions,
    serializeLanguages
} from "@lionweb/core"
import { languageAsText } from "@lionweb/utilities"

import { deepEqual } from "../test-utils/assertions.js"
import { logIssues, logUnresolvedReferences } from "../test-utils/test-helpers.js"

const lioncore = LionWebVersions.v2023_1.lioncoreFacade.language

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
        deepEqual(languageAsText(language), languageAsText(lioncore))
        // deepEqual on object-level is not good enough (- maybe because of class JIT'ing?):
        // deepEqual(deserialization, lioncore)
        // TODO  implement proper equality/comparison
    })
})
