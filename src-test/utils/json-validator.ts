import {Ajv, ErrorObject, addFormats, assertEquals} from "../deps.ts"
import {writeJsonAsFile} from "./json.ts"


const ajv = new Ajv({
    allErrors: true,        // don't stop after 1st error
    strict: true,
    allowUnionTypes: true,  // necessary for validating against the meta-schema
    validateSchema: false   // prevent that Ajv throws with 'no schema with key or ref "https://json-schema.org/draft/2020-12/schema"'
    // It seems weird that Ajv can't validate the schemas themselves (against a meta-schema) but you have to tweak things to do that yourself...
})
addFormats(ajv)


/**
 * Creates a JSON validator for the given JSON Schema.
 */
const createJsonValidatorForSchema = (schema: unknown): (json: unknown) => ErrorObject[] => {
    // deno-lint-ignore no-explicit-any
    const ajvSchemaValidator = ajv.compile(schema as any)
    return (json: unknown): ErrorObject[] => {
        const valid = ajvSchemaValidator(json)
        return valid ? [] : ajvSchemaValidator.errors!
    }
}

import metaSchema from "./json.schema.json" assert { type: "json" }
/*
 * Note: this meta-schema was downloaded from https://www.jsonschemavalidator.net/.
 * Steps:
 *   - Select "Schema Draft v7" in left drop-down selector, copy the contents into a file.
 *   - Change top-level `$id` field to something other than "https://json-schema.org/draft/2020-12/schema".
 * TODO  download that file and tweak it automatically/programmatically
 */


/**
 * Asserts that the given JSON validates against the given JSON Schema.
 * If not, it stores the errors at the given file (path), and assert-fails.
 * If it does validate, it makes sure that no errors file remains.
 */
const assertJsonValidates = async (json: unknown, schema: unknown, pathErrorsFile: string, message?: string) => {
    const jsonValidator = createJsonValidatorForSchema(schema)
    const errors = jsonValidator(json)
    if (errors.length > 0) {
        await writeJsonAsFile(pathErrorsFile, errors)
    } else {
        try {
            await Deno.remove(pathErrorsFile)
        } catch (_) {
            // (do nothing)
        }
    }
    assertEquals(errors.length, 0, message)
}

export {
    assertJsonValidates,
    createJsonValidatorForSchema,
    metaSchema
}

