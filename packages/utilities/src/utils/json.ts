import { asPrettyJsonString } from "@lionweb/ts-utils"
import { readFileSync, writeFileSync } from "fs"


export const writeJsonAsFile = (path: string, json: unknown) => writeFileSync(path, asPrettyJsonString(json))

export const readFileAsJson = (path: string): unknown => JSON.parse(readFileSync(path).toString())

