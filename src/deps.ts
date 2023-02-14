// for src/m3/ecore/types.ts:
import {parse} from "https://deno.land/x/xml@2.1.0/mod.ts"

// for all unit tests:
import {
    assertEquals
} from "https://deno.land/std@0.168.0/testing/asserts.ts"

// for src/m3/test/json-validator.ts:
import Ajv, {ErrorObject} from "https://esm.sh/v106/ajv@8.12.0"
import addFormats from "https://esm.sh/v106/ajv-formats@2.1.0"

// for src/m3/id-generation.ts:
import {
    createHash
} from "https://deno.land/std@0.168.0/node/internal/crypto/hash.ts"
import {nanoid} from "npm:nanoid@4.0.0"

// for src/m3/diagrams/*-generator.ts:
import {
    asString,
    indentWith,
    NestedString
} from "npm:littoral-templates@0.2.2"

// for src/utils/local-files.ts:
import * as path from "https://deno.land/std@0.177.0/path/mod.ts"


export {
    parse as mod_parse,
    assertEquals,
    Ajv,
    addFormats,
    createHash,
    nanoid,
    asString,
    indentWith,
    path
}

export type {
    ErrorObject,
    NestedString
}

