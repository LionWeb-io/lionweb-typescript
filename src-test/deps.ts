// for all unit tests:
import {
    assertEquals
} from "https://deno.land/std@0.168.0/testing/asserts.ts"

// for src-test/m3/json-validator.ts:
import Ajv, {ErrorObject} from "https://esm.sh/v106/ajv@8.12.0"
import addFormats from "https://esm.sh/v106/ajv-formats@2.1.0"


export {
    assertEquals,
    Ajv,
    addFormats
}

export type {
    ErrorObject
}

