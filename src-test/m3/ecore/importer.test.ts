import {assertEquals, parse} from "../../deps.ts"
import {asLIonCoreMetamodel} from "../../../src/m3/ecore/importer.ts"
import {serializeLanguage} from "../../../src/m3/serializer.ts"
import {EcoreXml} from "../../../src/m3/ecore/types.ts"
import {issuesLanguage} from "../../../src/m3/constraints.ts"
import {checkReferences} from "../../../src/m3/reference-checker.ts"
import {
    generatePlantUmlForMetamodel
} from "../../../src/m3/diagrams/PlantUML-generator.ts"
import {
    generateMermaidForMetamodel
} from "../../../src/m3/diagrams/Mermaid-generator.ts"
import {
    logIssues,
    logUnresolvedReferences,
    undefinedValuesDeletedFrom
} from "../../utils/test-helpers.ts"
import {libraryMetamodel} from "../library-meta.ts"


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
        const metamodel = asLIonCoreMetamodel(ecoreXml, "1")
        const unresolvedReferences = checkReferences(metamodel)
        logUnresolvedReferences(unresolvedReferences)
        assertEquals(unresolvedReferences, [])
        const issues = issuesLanguage(metamodel)
        logIssues(issues)
        assertEquals(issues, [])
        const serialization = serializeLanguage(metamodel)
        assertEquals(undefinedValuesDeletedFrom(serialization), undefinedValuesDeletedFrom(serializeLanguage(libraryMetamodel)))
        assertEquals(generatePlantUmlForMetamodel(metamodel), generatePlantUmlForMetamodel(libraryMetamodel))
        assertEquals(generateMermaidForMetamodel(metamodel), generateMermaidForMetamodel(libraryMetamodel))
    })

})

