import { LanguageRegistry } from "../languages/index.js"
import { validateFile } from "./FileUtils.js"

const file1 = process.argv[2]

const registry = new LanguageRegistry()
validateFile(file1, registry)
