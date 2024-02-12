import {extname} from "path"
import {Language, SerializationChunk} from "@lionweb/core"
import {readChunk, tryLoadAllAsLanguages, writeJsonAsFile} from "@lionweb/utilities"
import {separate} from "../language-aware-args.js"


export const executeMeasureCommand = async (args: string[]) => {
    const {chunkPaths, languagePaths} = separate(args)
    const languages = await tryLoadAllAsLanguages(languagePaths)
    chunkPaths.forEach((chunkPath) => {
        measureSerializationChunk(chunkPath, languages)
    })
}

const measureSerializationChunk = async (path: string, languages: Language[]) => {
    const chunk = await readChunk(path)
    const extLessPath = path.substring(0, path.length - extname(path).length)
    writeJsonAsFile(
        extLessPath + ".metrics.json",
        measure(chunk)
    )
    console.log(`wrote metrics for: ${path}`)
}


// TODO  move all of this to @lionweb/utilities (in the end)

type ClassifierInstantiationMetric = {
    name?: string
    key: string         // == key of classifier
    language: string    // == key of language
    version: string
    count: number
    // TODO  add property to say the classifier is a concept, or annotation (or enum)?
}

type Metrics = {
    instantiations: ClassifierInstantiationMetric[]
}

const measure = (serializationChunk: SerializationChunk): Metrics => ({
    instantiations: []
})
    /*
     * TODO  compute ClassifierInstantiationMetrics
     *
     * E.g. for library.json:
     * {
     *   instantiations: [
     *    { name: "Library", key: "library", language: "library", version: "1", count: 1 },
     *    { name: "Book", key: "Book", language: "library", version: "1", count: 1 },
     *    { name: "GuideBookWriter", key: "GuideBookWriter", language: "library", version: "1", count: 1 },
     *   ]
     * }
     *
     * node dist/lionweb-cli.js measure ../artifacts/chunks/instances/library.json --language ./artifacts/chunks/languages/library.json
     *      -> gives names of classifiers
     * node dist/lionweb-cli.js measure ../artifacts/chunks/instances/library.json
     *      -> only gives keys of classifiers
     */

