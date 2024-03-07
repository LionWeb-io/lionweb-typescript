import {extname} from "path"
import {conceptsOf, groupBy, Language, MemoisingSymbolTable, MetaPointer, SerializationChunk} from "@lionweb/core"
import {readChunk, tryLoadAllAsLanguages, writeJsonAsFile} from "@lionweb/utilities"
import {separate} from "../language-aware-args.js"

export const executeMeasureCommand = async (args: string[]) => {
    const { chunkPaths, languagePaths } = separate(args)
    const languages = await tryLoadAllAsLanguages(languagePaths)
    chunkPaths.forEach(chunkPath => {
        measureSerializationChunk(chunkPath, languages)
    })
}

const measureSerializationChunk = async (path: string, languages: Language[]) => {
    const chunk = await readChunk(path)
    const extLessPath = path.substring(0, path.length - extname(path).length)
    const metricsPath = extLessPath + ".metrics.json"
    writeJsonAsFile(metricsPath, measure(chunk, languages))
    console.log(`Wrote metrics for ${path} --> ${metricsPath}`)
}

// TODO  move all of this to @lionweb/utilities (in the end)

type ClassifierInstantiationMetric = {
    name?: string
    key: string // == key of classifier
    language: string // == key of language
    version: string
    count: number
    // TODO  add property to say the classifier is a concept, or annotation (or enum)?
}

type Metrics = {
    instantiations: ClassifierInstantiationMetric[]
    unusedConcreteConcepts: MetaPointer[]
}

const measure = (serializationChunk: SerializationChunk, languages: Language[]): Metrics => {
    const symbolTable = new MemoisingSymbolTable(languages)

    const metaPointerAsText = (classifier: MetaPointer) => `${classifier.key}:${classifier.language}:${classifier.version}`

    // group nodes by classifier key, language, and version:
    const instantiationsPerId = groupBy(serializationChunk.nodes, ({ classifier }) => metaPointerAsText(classifier))

    // map grouped nodes to instantiations with count:
    const instantiations = Object.values(instantiationsPerId).map((nodes) => ({
        ...nodes[0].classifier,
        name: symbolTable.entityMatching(nodes[0].classifier)?.name,
        count: nodes.length
    }))

    // compute all concrete concepts for the language:
    const concreteConcepts = languages.flatMap(conceptsOf).filter((concept) => !concept.abstract)
    const unusedConcreteConcepts = concreteConcepts.filter((concept) => !(metaPointerAsText(concept.metaPointer()) in instantiationsPerId))

    // return the metrics object:
    return {
        instantiations,
        unusedConcreteConcepts: unusedConcreteConcepts.map(concept => ({
            language: concept.language.key,
            version: concept.language.version,
            key: concept.key
        }))
    }
}

