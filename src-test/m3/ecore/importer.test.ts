import {assert} from "chai"
const {deepEqual} = assert
import {readFileSync} from "fs"
import {parseString} from "xml2js"

import {checkReferences, issuesLanguage, serializeLanguage} from "../../../src-pkg/index.js"
import {asLIonCoreLanguage} from "../../../src-utils/m3/ecore/importer.js"
import {logIssues, logUnresolvedReferences, undefinedValuesDeletedFrom} from "../../utils/test-helpers.js"
import {libraryLanguage} from "../library-language.js"
import {sortSerialization} from "../../../src-utils/serialization-utils.js"


describe("Ecore importer", () => {

    it("import 'library' Ecore XML", () => {
        const data = readFileSync("src-test/m3/ecore/library.ecore").toString()
        parseString(data, (err, ecoreXml) => {
            const language = asLIonCoreLanguage(ecoreXml, "1")
            const unresolvedReferences = checkReferences(language)
            logUnresolvedReferences(unresolvedReferences)
            deepEqual(unresolvedReferences, [])
            const issues = issuesLanguage(language)
            logIssues(issues)
            deepEqual(issues, [])
            const serialization = serializeLanguage(language)
            deepEqual(sortSerialization(undefinedValuesDeletedFrom(serialization)), sortSerialization(undefinedValuesDeletedFrom(serializeLanguage(libraryLanguage))))
        })
    })

})

