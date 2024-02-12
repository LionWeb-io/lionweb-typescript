import { LanguageRegistry } from "../languages/index.js"
import { validateFolder } from "./FileUtils.js"

const folder = process.argv[2]

const registry = new LanguageRegistry()
validateFolder(folder, registry)
