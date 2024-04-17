#!/usr/bin/env node


import {argv} from "process"

import {diagramFromSerializationChunkAt} from "./m3/diagram-command.js"
import {diffSerializationChunks} from "./serialization/diff-command.js"
import {generateTsTypesWith} from "./m3/generate-ts-types-command.js"
import {inferLanguages} from "./infer-language-command.js"
import {executeMeasureCommand} from "./serialization/measure-command.js"
import {repairSerializationChunkAt} from "./serialization/repair-command.js"
import {sortSerializationChunkAt} from "./serialization/sort-command.js"
import {executeTextualizeCommand} from "./serialization/textualize-command.js"
import {runValidationOnSerializationChunkAt} from "./validate-command.js"


const main = async (args: string[])=> {

    const DIAGRAM_COMMAND = "diagram"
    const DIFF_COMMAND = "diff"
    const GENERATE_TS_TYPES_COMMAND = "generate-ts-types"
    const INFER_LANGUAGE_COMMAND = "infer-language"
    const MEASURE_COMMAND = "measure"
    const REPAIR_COMMAND = "repair"
    const SORT_COMMAND = "sort"
    const TEXTUALIZE_COMMAND = "textualize"
    const VALIDATE_COMMAND = "validate"

    const commands = [DIAGRAM_COMMAND, DIFF_COMMAND, GENERATE_TS_TYPES_COMMAND, INFER_LANGUAGE_COMMAND, MEASURE_COMMAND, REPAIR_COMMAND, SORT_COMMAND, TEXTUALIZE_COMMAND, VALIDATE_COMMAND].sort()

    if (args.length <= 2) {
        console.log(
`lionweb-cli is a LionWeb utility around LionWeb-TypeScript

Usage: $ npx @lionweb/cli <command> <arguments>

Available commands are:

${commands.map((command) => `    ${command}\n`).join(``)}
`
        )
        return
    }

    const command = args[2]
    const commandArgs = args.slice(3)
    switch (command) {

        case DIAGRAM_COMMAND: {
            if (commandArgs.length === 0) {
                console.log(
`The ${DIAGRAM_COMMAND} command generates a PlantUML and Mermaid diagram for the language that the given paths point to.`
                )
            } else {
                commandArgs.forEach(diagramFromSerializationChunkAt)
            }
            break
        }

        case DIFF_COMMAND: {
            if (commandArgs.length !== 3) {
                console.log(
`The ${DIFF_COMMAND} command generates the difference between two serialization chunks, in a JSON format.
The chunks to diff are given as the first two paths, and the path for the diff JSON file as the third.`
                )
            } else {
                await diffSerializationChunks(commandArgs[0], commandArgs[1], commandArgs[2])
            }
            break
        }
        case GENERATE_TS_TYPES_COMMAND: {
            if (commandArgs.length === 0) {
                console.log(
`The ${GENERATE_TS_TYPES_COMMAND} command generates a TypeScript source files with type definitions for the given (JSON serializations of) languages, assuming the use of the dynamic façade.`
                )
            } else {
                await generateTsTypesWith(commandArgs)
            }
            break
        }

        case MEASURE_COMMAND: {
            if (commandArgs.length === 0) {
                console.log(
                    `The ${MEASURE_COMMAND} command computes statistics on the given serialization chunks,
such as which concepts are instantiated how often.

Usage: npx @lionweb/cli ${MEASURE_COMMAND} <paths_to_chunks> --language[s] <path_to_chunks_of_languages>

Chunks given after a '--language' or '--languages' flag (which are synonyms) are assumed to be serializations of languages.
These languages are then used to try and resolve the keys of languages' entities and their features to names.`
                )
            } else {
                await executeMeasureCommand(commandArgs)
            }
            break
        }

        case REPAIR_COMMAND: {
            if (commandArgs.length === 0) {
                console.log(
`The ${REPAIR_COMMAND} command "repairs" the given JSON files that represent serialization chunks.
Right now, that means that key-value pairs appear in precisely the same order as they do in the specification.
Missing key-value pairs are put in and get their default values.`
                )
            } else {
                commandArgs.forEach(repairSerializationChunkAt)
            }
            return
        }

        case SORT_COMMAND: {
            if (commandArgs.length === 0) {
                console.log(
                    `The ${SORT_COMMAND} command sorts JSON files that are serialization chunk – sorted serialization chunks can be easily compared.
(See the README.md for more information.)`
                )
            } else {
                commandArgs.forEach(sortSerializationChunkAt)
            }
            break
        }

        case TEXTUALIZE_COMMAND: {
            if (commandArgs.length === 0) {
                console.log(
`The ${TEXTUALIZE_COMMAND} command produces purely textual renderings of the given serialization chunks.
Chunks given after a '--language' or '--languages' flag (which are synonyms) are assumed to be serializations of languages.
These languages are then used to try and resolve the keys of languages' entities and their features to names.
If a serialization chunk is the serialization of a language (as instance of LionCore/M3), then the LionCore/M3-specific
textual syntax is used, unless a flag '--asRegular' is provided.
`
                )
            } else {
                await executeTextualizeCommand(commandArgs)
            }
            break
        }

        case VALIDATE_COMMAND: {
            if (commandArgs.length === 0) {
                console.log(
`The ${VALIDATE_COMMAND} command validates a serialization chunk.
Usage: npx @lionweb/cli ${VALIDATE_COMMAND} <path_to_chunk>`
                )
            } else {
                commandArgs.forEach(runValidationOnSerializationChunkAt)
            }
            break
        }

        case INFER_LANGUAGE_COMMAND: {
            if (commandArgs.length === 0) {
                console.log(
`The ${INFER_LANGUAGE_COMMAND} command infer language(s) from a given serialization chunk. \nUsage: npx @lionweb/cli infer-language <path_to_chunk>`
                )
            } else {
                await inferLanguages(commandArgs[0])
            }
            return
        }

        default: {
            console.error(`command "${command}" is not recognized`)
        }
    }

}

await main(argv)

