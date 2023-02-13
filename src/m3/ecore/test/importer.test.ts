import {assertEquals} from "../../../deps.ts"
import {asLIonCoreMetamodel} from "../importer.ts"
import {serializeMetamodel} from "../../serializer.ts"
import {textAsEcoreXml} from "../types.ts"
import {issuesMetamodel} from "../../constraints.ts"
import {checkReferences} from "../../reference-checker.ts"
import {
    generatePlantUmlForMetamodel
} from "../../diagrams/PlantUML-generator.ts"
import {
    generateMermaidForMetamodel
} from "../../diagrams/Mermaid-generator.ts"
import {
    logIssues,
    logUnresolvedReferences,
    undefinedValuesDeletedFrom
} from "../../test/test-helpers.ts"
import {libraryMetamodel} from "../../test/library-meta.ts"


Deno.test("Ecore importer", async (tctx) => {

    await tctx.step("import 'library' Ecore XML", () => {
        const data = Deno.readTextFileSync("src/m3/ecore/test/library.ecore")
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

