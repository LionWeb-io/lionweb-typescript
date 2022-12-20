import Ajv, {ErrorObject} from "https://esm.sh/ajv@8.11.2"
import addFormats from "https://esm.sh/ajv-formats@2.1.1"


const ajv = new Ajv({
    allErrors: true,        // don't stop after 1st error
    strict: true,
    validateSchema: false   // prevent that Ajv throws with 'no schema with key or ref "https://json-schema.org/draft/2020-12/schema"'
})
addFormats(ajv)


export const createJsonValidatorForSchema = (schema: unknown): (json: unknown) => ErrorObject[] => {
    const ajvSchemaValidator = ajv.compile(schema as any)
    return (json: unknown): ErrorObject[] => {
        const valid = ajvSchemaValidator(json)
        return valid ? [] : ajvSchemaValidator.errors!
    }
}

