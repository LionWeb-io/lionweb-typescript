import {assertEquals, parse} from "../../deps.ts"
import {asLIonCoreLanguage} from "../../../src-utils/m3/ecore/importer.ts"
import {serializeLanguage} from "../../../src/m3/serializer.ts"
import {EcoreXml} from "../../../src-utils/m3/ecore/types.ts"
import {issuesLanguage} from "../../../src/m3/constraints.ts"
import {checkReferences} from "../../../src/m3/reference-checker.ts"
import {logIssues, logUnresolvedReferences, undefinedValuesDeletedFrom} from "../../utils/test-helpers.ts"
import {libraryLanguage} from "../library-language.ts"
import {sortSerialization} from "../../../src-utils/serialization-utils.ts"


/**
 * Parse the given string as Ecore XML into objects matching the {@link EcoreXml the Ecore type definition}.
 */
const textAsEcoreXml = (data: string): EcoreXml =>
    parse(data, {emptyToNull: false, reviveNumbers: false}) as unknown as EcoreXml


Deno.test("Ecore importer", async (tctx) => {

    await tctx.step("import 'library' Ecore XML", () => {
        const data = Deno.readTextFileSync("src-test/m3/ecore/library.ecore")
            // Note: can't use Deno's import for this, as it's XML.
        const ecoreXml = textAsEcoreXml(data)
        const language = asLIonCoreLanguage(ecoreXml, "1")
        const unresolvedReferences = checkReferences(language)
        logUnresolvedReferences(unresolvedReferences)
        assertEquals(unresolvedReferences, [])
        const issues = issuesLanguage(language)
        logIssues(issues)
        assertEquals(issues, [])
        const serialization = serializeLanguage(language)
        assertEquals(sortSerialization(undefinedValuesDeletedFrom(serialization)), sortSerialization(undefinedValuesDeletedFrom(serializeLanguage(libraryLanguage))))
    })

})

