import {assertEquals} from "../deps.ts"
import {lioncore} from "../../src/m3/self-definition.ts"
import {
    generateMermaidForMetamodel
} from "../../src/m3/diagrams/Mermaid-generator.ts"
import {
    generatePlantUmlForMetamodel
} from "../../src/m3/diagrams/PlantUML-generator.ts"
import {checkReferences} from "../../src/m3/reference-checker.ts"
import {issuesLanguage} from "../../src/m3/constraints.ts"
import {serializeLanguage} from "../../src/m3/serializer.ts"
import {deserializeLanguage} from "../../src/m3/deserializer.ts"
import {readFileAsJson, writeJsonAsFile} from "../utils/json.ts"
import {SerializedModel} from "../../src/serialization.ts"
import {
    logIssues,
    logUnresolvedReferences,
    undefinedValuesDeletedFrom
} from "../utils/test-helpers.ts"


Deno.test("meta-circularity (LIonCore)", async (tctx) => {

    await tctx.step("generate PlantUML and Mermaid diagrams (no assertions)", async () => {
        await Deno.writeTextFileSync("diagrams/metametamodel-gen.puml", generatePlantUmlForMetamodel(lioncore))
        await Deno.writeTextFileSync("diagrams/metametamodel-gen.md", generateMermaidForMetamodel(lioncore))
    })

    await tctx.step("check for unresolved references", () => {
        const unresolvedReferences = checkReferences(lioncore)
        logUnresolvedReferences(unresolvedReferences)
        assertEquals(unresolvedReferences, [], "number of expected unresolved references -- see above for the locations")
    })

    await tctx.step("check constraints", () => {
        const issues = issuesLanguage(lioncore)
        logIssues(issues)
        assertEquals(issues, [], "number of expected constraint violations -- see above for the issues")
    })

    const serializedLioncorePath = "models/meta/lioncore.json"
    await tctx.step("serialize LIonCore (no assertions)", async () => {
        const serialization = serializeLanguage(lioncore)
        await writeJsonAsFile(serializedLioncorePath, serialization)
    })

    await tctx.step("deserialize LIonCore", async () => {
        const serialization = await readFileAsJson(serializedLioncorePath) as SerializedModel
        const deserialization = deserializeLanguage(undefinedValuesDeletedFrom(serialization))
        assertEquals(deserialization, lioncore)
    })

})

