import { readFileSync, writeFileSync } from "fs"

const asPrettyString = (json: unknown): string => JSON.stringify(json, null, 2)

export const writeJsonAsFile = (path: string, json: unknown) => writeFileSync(path, asPrettyString(json))

export const readFileAsJson = (path: string): unknown => JSON.parse(readFileSync(path).toString())
