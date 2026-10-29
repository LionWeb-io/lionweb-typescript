import { allLionWebVersions, checkReferences, issuesLanguage } from "@lionweb/core"

import { deepEqual } from "../test-utils/assertions.js"
import { logIssues, logUnresolvedReferences } from "../test-utils/test-helpers.js"


for (const lionWebVersion of allLionWebVersions) {
   const lioncoreBuiltins = lionWebVersion.builtinsFacade.language

    describe(`check the LionCore built-in language in version ${lionWebVersion.serializationFormatVersion}`, () => {

        it("check for unresolved references", () => {
            const unresolvedReferences = checkReferences(lioncoreBuiltins)
            logUnresolvedReferences(unresolvedReferences)
            deepEqual(unresolvedReferences, [], "number of expected unresolved references — see above for the locations")
        })

        it("check constraints", () => {
            const issues = issuesLanguage(lioncoreBuiltins)
            logIssues(issues)
            deepEqual(issues, [], "number of expected constraint violations — see above for the issues")
        })

    })

}

