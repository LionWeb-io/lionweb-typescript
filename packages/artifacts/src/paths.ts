import { join } from "path"

const diagramsPath = "diagrams"
export const diagramPath = (fileName: string) => join(diagramsPath, fileName)

const chunksPath = "chunks"
const instancesPath = join(chunksPath, "instances")
const languagesPath = join(chunksPath, "languages")

export const instancePath = (fileName: string) => join(instancesPath, fileName)
export const languagePath = (fileName: string) => join(languagesPath, fileName)
