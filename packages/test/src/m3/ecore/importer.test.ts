import {assert} from "chai"
const {deepEqual} = assert
import {readFileSync} from "fs"
import {parseString} from "xml2js"

import {checkReferences, issuesLanguage, serializeLanguages} from "@lionweb/core"
import {asLionCoreLanguage, sortedSerializationChunk} from "@lionweb/utilities"
import {logIssues, logUnresolvedReferences} from "../../utils/test-helpers.js"
import {libraryLanguage} from "../../languages/library.js"


describe("Ecore importer", () => {

    it("import 'library' Ecore XML", () => {
        const data = readFileSync("src/m3/ecore/library.ecore").toString()
        parseString(data, (err, ecoreXml) => {
            const language = asLionCoreLanguage(ecoreXml, "1")
            const unresolvedReferences = checkReferences(language)
            logUnresolvedReferences(unresolvedReferences)
            deepEqual(unresolvedReferences, [])
            const issues = issuesLanguage(language)
            logIssues(issues)
            deepEqual(issues, [])
            const serialization = serializeLanguages(language)
            deepEqual(sortedSerializationChunk(serialization), sortedSerializationChunk(serializeLanguages(libraryLanguage)))
        })
    })

})

