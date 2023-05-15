import {SerializedModel} from "../../src/serialization.ts"
import {Language} from "../../src/m3/types.ts"
import {schemaFor} from "../../src/m3/schema-generator.ts"
import {readFileAsJson} from "./json.ts";
import {assertJsonValidates} from "./json-validator.ts"


const genericSchema = await readFileAsJson("schemas/generic.serialization.schema.json")

const assertSerializationJsonValidates = async (serialization: SerializedModel, language: Language) => {
    await assertJsonValidates(serialization, genericSchema, "???")

    const specificSchema = schemaFor(language)
    await assertJsonValidates(serialization, specificSchema, "???")
}


export {
    assertSerializationJsonValidates
}

