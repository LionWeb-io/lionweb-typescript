import { asPrettyJsonString } from "@lionweb/ts-utils"
import { readFileSync, writeFileSync } from "fs"


/**
 * @return the JSON parsed that’s (synchronously) read from the contents of the file indicated through `path`.
 *
 * @param path The path to a JSON file.
 *
 * This is the same function as in the utilities package, but that one’s going to be deprecated later on,
 * so that the utilities package doesn’t need to rely on Node.js.
 */
export const readFileAsJsonSync = (path: string): unknown =>
    JSON.parse(readFileSync(path).toString())


/**
 * Writes the JSON passed as `json` to a file with the given `path`.
 *
 * @param path The path for the JSON file to write — which doesn’t need to exist, but the path towards it does.
 * @param json The JSON to write.
 *
 * This is the same function as in the utilities package, but that one’s going to be deprecated later on,
 * so that the utilities package doesn’t need to rely on Node.js.
 */
export const writeJsonAsFileSync = (path: string, json: unknown) =>
    writeFileSync(path, asPrettyJsonString(json))

