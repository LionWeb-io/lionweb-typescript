import {
    assertEquals
} from "https://deno.land/std@0.168.0/testing/asserts.ts"

import {asLIonCoreMetamodel} from "../ecore-importer.ts"
import {serializeMetamodel} from "../serializer.ts"
import {writeJsonAsFile} from "../../utils/json.ts"
import {textAsEcoreXml} from "../ecore-types.ts"
import {issuesMetamodel} from "../constraints.ts"
import {checkReferences} from "../reference-checker.ts"
import {
    generatePlantUmlForMetamodel
} from "../diagrams/PlantUML-generator.ts"


Deno.test("Ecore importer", async (tctx) => {

    await tctx.step("import 'library' Ecore XML", async () => {
        const data = Deno.readTextFileSync("models/library.ecore")
        const ecoreXml = textAsEcoreXml(data)
        await writeJsonAsFile("models/library.ecore.json", ecoreXml)    // for debugging purposes -- file is Git-ignored
        const metamodel = asLIonCoreMetamodel(ecoreXml)
        const unresolvedRefs = checkReferences(metamodel)
        assertEquals(unresolvedRefs, [])
        const issues = issuesMetamodel(metamodel)
        assertEquals(issues, [])
        const serialization = serializeMetamodel(metamodel)
        await writeJsonAsFile("models/library-imported-from-ecore.json", serialization)
        await Deno.writeTextFileSync("diagrams/library-imported-from-ecore.puml", generatePlantUmlForMetamodel(metamodel))
    })

})

