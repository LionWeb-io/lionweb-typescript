import {
    assertEquals
} from "https://deno.land/std@0.160.0/testing/asserts.ts"

import {lioncore} from "./self-definition.ts"
import {
    generatePlantUmlForMetamodel
} from "../diagrams/PlantUML-generator.ts"
import {checkReferences} from "../reference-checker.ts"
import {issuesMetamodel} from "../constraints.ts"
import {serializeMetamodel} from "../serializer.ts"
import {deserializeMetamodel} from "../deserializer.ts"
import {readFileAsJson, writeJsonAsFile} from "../../utils/json.ts"
import {
    createJsonValidatorForSchema,
    metaValidator
} from "./json-validator.ts"
import {SerializedNode} from "../../serialization.ts"
import {schemaFor} from "../schema-generator.ts"


Deno.test("meta-circularity (LIonCore/M3)", async (tctx) => {

    await tctx.step("generate PlantUML diagram (no assertions)", async () => {
        await Deno.writeTextFileSync("diagrams/metametamodel-gen.puml", generatePlantUmlForMetamodel(lioncore))
    })

    await tctx.step("check for unresolved references", async () => {
        const unresolvedReferences = checkReferences(lioncore)
        if (unresolvedReferences.length > 0) {
            console.error(`unresolved references:`)
            unresolvedReferences.forEach((location) => {
                console.error(`\t${location}`)
            })
        }
        assertEquals(unresolvedReferences.length, 0, "number of expected unresolved references -- see above for the locations")
    })

    await tctx.step("check constraints", async () => {
        const issues = issuesMetamodel(lioncore)
        if (issues.length > 0) {
            console.error(`constraint violations:`)
            issues.forEach(({message}) => {
                console.error(`\t${message}`)
            })
        }
        assertEquals(issues.length, 0, "number of expected constraint violations -- see above for the issues")
    })

    const serializedLioncorePath = "models/lioncore.json"
    await tctx.step("serialize LIonCore (no assertions)", async () => {
        const serialization = serializeMetamodel(lioncore)
        await writeJsonAsFile(serializedLioncorePath, serialization)
    })

    await tctx.step("deserialize LIonCore", async () => {
        const serialization = await readFileAsJson(serializedLioncorePath) as SerializedNode[]
        const deserialization = deserializeMetamodel(serialization)
        assertEquals(deserialization, lioncore)
    })

    await tctx.step("validate serialization of LIonCore", async () => {
        const serialization = serializeMetamodel(lioncore)
        const schema = await readFileAsJson("schemas/generic-serialization.schema.json")
        const metaErrors = metaValidator(schema)
        assertEquals(metaErrors, [])
        const serializationValidator = createJsonValidatorForSchema(schema)
        const errors = serializationValidator(serialization)
        assertEquals(errors, [])
    })

    await tctx.step("generate JSON Schema for serialization format of LIonCore/M3 instances (no assertions)", async () => {
        const schema = schemaFor(lioncore)
        const metaErrors = metaValidator(schema)
        assertEquals(metaErrors, [])
        await writeJsonAsFile("schemas/lioncore.serialization.schema.json", schema)
        const serialization = serializeMetamodel(lioncore)
        const validator = createJsonValidatorForSchema(schema)
        const errors = validator(serialization)
        assertEquals(errors, [])
    })

    // TODO  write unit tests re: (de-)serialization

})


/*
 * TODOs:
 *
 *  0. [✓] rephrase as Deno tests
 *  1. [✓] check references - only single-valued references can be unresolved
 *  2. […] check (some) constraints
 *  3. [ ] generate types.ts? (then: sort type def.s alphabetically)
 */

