import {Ajv, ErrorObject, addFormats} from "../../deps.ts"


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
export const createJsonValidatorForSchema = (schema: unknown): (json: unknown) => ErrorObject[] => {
    // deno-lint-ignore no-explicit-any
    const ajvSchemaValidator = ajv.compile(schema as any)
    return (json: unknown): ErrorObject[] => {
        const valid = ajvSchemaValidator(json)
        return valid ? [] : ajvSchemaValidator.errors!
    }
}


const metaSchema = JSON.parse(Deno.readTextFileSync("src/m3/test/json.schema.json"))
/*
 * Note: this meta-schema was downloaded from https://www.jsonschemavalidator.net/.
 * Steps:
 *   - Select "Schema Draft v7" in left drop-down selector, copy the contents into a file.
 *   - Change top-level `$id` field to something other than "https://json-schema.org/draft/2020-12/schema".
 * TODO  download that file and tweak it automatically/programmatically
 */

/**
 * A validator that validates given JSON as a JSON Schema.
 */
export const metaValidator = createJsonValidatorForSchema(metaSchema)

