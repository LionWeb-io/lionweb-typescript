import {assertEquals} from "../../../src/deps.ts"
import {asLIonCoreMetamodel} from "../../../src/m3/ecore/importer.ts"
import {serializeMetamodel} from "../../../src/m3/serializer.ts"
import {textAsEcoreXml} from "../../../src/m3/ecore/types.ts"
import {issuesMetamodel} from "../../../src/m3/constraints.ts"
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
} from "../test-helpers.ts"
import {libraryMetamodel} from "../library-meta.ts"


Deno.test("Ecore importer", async (tctx) => {

    await tctx.step("import 'library' Ecore XML", () => {
        const data = Deno.readTextFileSync("src-test/m3/ecore/library.ecore")
            // Note: can't use Deno's import for this, as it's XML.
        const ecoreXml = textAsEcoreXml(data)
        const metamodel = asLIonCoreMetamodel(ecoreXml)
        const unresolvedReferences = checkReferences(metamodel)
        logUnresolvedReferences(unresolvedReferences)
        assertEquals(unresolvedReferences, [])
        const issues = issuesMetamodel(metamodel)
        logIssues(issues)
        assertEquals(issues, [])
        const serialization = serializeMetamodel(metamodel)
        assertEquals(undefinedValuesDeletedFrom(serialization), undefinedValuesDeletedFrom(serializeMetamodel(libraryMetamodel)))
        assertEquals(generatePlantUmlForMetamodel(metamodel), generatePlantUmlForMetamodel(libraryMetamodel))
        assertEquals(generateMermaidForMetamodel(metamodel), generateMermaidForMetamodel(libraryMetamodel))
    })

})

