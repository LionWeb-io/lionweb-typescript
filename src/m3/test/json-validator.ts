import Ajv, {ErrorObject} from "https://esm.sh/ajv@8.11.2"
import addFormats from "https://esm.sh/ajv-formats@2.1.1"


const ajv = new Ajv({
    allErrors: true,        // don't stop after 1st error
    strict: true,
    allowUnionTypes: true,  // necessary for validating against the meta-schema
    validateSchema: false   // prevent that Ajv throws with 'no schema with key or ref "https://json-schema.org/draft/2020-12/schema"'
    // It seems weird that Ajv can't validate the schemas themselves (against a meta-schema) but you have to tweak things to do that yourself...
})
addFormats(ajv)


export const createJsonValidatorForSchema = (schema: unknown): (json: unknown) => ErrorObject[] => {
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
export const metaValidator = createJsonValidatorForSchema(metaSchema)

