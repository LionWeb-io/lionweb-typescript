import {join} from "path"


const diagramsPath = "diagrams"
export const diagramPath = (fileName: string) => join(diagramsPath, fileName)

const modelsPath = "models"
const instancesPath = join(modelsPath, "instances")
const languagesPath = join(modelsPath, "languages")

export const instancePath = (fileName: string) => join(instancesPath, fileName)
export const languagePath = (fileName: string) => join(languagesPath, fileName)

export const builtinsPath = languagePath("builtins.json")
export const lioncorePath = languagePath("lioncore.json")

