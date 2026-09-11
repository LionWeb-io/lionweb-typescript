import { asPrettyJsonString } from "@lionweb/ts-utils"
import { readFileSync, writeFileSync } from "fs"


/**
 * @deprecated Use `writeJsonAsFileSync` from `@lionweb/node-utils` instead,
 * so that the utilities package doesn’t need to depend on Node.js.
 */
export const writeJsonAsFile = (path: string, json: unknown) => writeFileSync(path, asPrettyJsonString(json))

/**
 * @deprecated Use `writeJsonAsFileSync` from `@lionweb/node-utils` instead.
 * so that the utilities package doesn’t need to depend on Node.js.
 */
export const readFileAsJson = (path: string): unknown => JSON.parse(readFileSync(path).toString())

