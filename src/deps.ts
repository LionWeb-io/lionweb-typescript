// for src/m3/ecore/types.ts:
import {parse} from "https://deno.land/x/xml@2.1.0/mod.ts"

// for src/m3/id-generation.ts:
import {createHash} from "https://deno.land/std@0.168.0/node/crypto.ts"
import {nanoid} from "npm:nanoid@3.3.4"

// for src/m3/diagrams/*-generator.ts:
import {
    asString,
    indentWith,
    NestedString
} from "npm:littoral-templates@0.2.2"


export {
    parse as mod_parse,
    createHash,
    nanoid,
    asString,
    indentWith
}

export type {
    NestedString
}

