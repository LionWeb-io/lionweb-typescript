#!/usr/bin/env node


import {argv} from "process"

import {diagramFromSerialization} from "./m3/diagram-generator.js"
import {generateTsTypesWith} from "./m3/ts-types-generator.js"
import {sortSerialization} from "./serialization/sorter.js"
import {repairSerializationChunk} from "./serialization/repairer.js"
import {executeTextualizeCommand} from "./serialization/textualizer.js"
import {runValidation} from "./validator.js"


const main = async (args: string[])=> {

    const DIAGRAM_COMMAND = "diagram"
    const SORT_COMMAND = "sort"
    const GENERATE_TS_TYPES_COMMAND = "generate-ts-types"
    const REPAIR_COMMAND = "repair"
    const TEXTUALIZE_COMMAND = "textualize"
    const VALIDATE_COMMAND = "validate"
    const commands = [DIAGRAM_COMMAND, SORT_COMMAND, GENERATE_TS_TYPES_COMMAND, REPAIR_COMMAND, TEXTUALIZE_COMMAND, VALIDATE_COMMAND].sort()

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
                commandArgs.forEach(diagramFromSerialization)
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
                commandArgs.forEach(sortSerialization)
            }
            return
        }

        case GENERATE_TS_TYPES_COMMAND: {
            if (commandArgs.length === 0) {
                console.log(
`The ${GENERATE_TS_TYPES_COMMAND} command generates a TypeScript source files with type definitions for the given (JSON serializations of) languages, assuming the use of the dynamic façade.`
                )
            } else {
                await generateTsTypesWith(commandArgs)
            }
            return
        }

        case REPAIR_COMMAND: {
            if (commandArgs.length === 0) {
                console.log(
`The ${REPAIR_COMMAND} command "repairs" the given JSON files that represent serialization chunks.
Right now, that means that key-value pairs appear in precisely the same order as they do in the specification.
Missing key-value pairs are put in and get their default values.`
                )
            } else {
                commandArgs.forEach(repairSerializationChunk)
            }
            return
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
            return
        }

        case VALIDATE_COMMAND: {
            if (commandArgs.length === 0) {
                console.log(
`The ${VALIDATE_COMMAND} command validates a serialization chunk. \nUsage: npx @lionweb/cli validate <path_to_chunk>`
                )
            } else {
                commandArgs.forEach(runValidation)
            }
            return
        }

        default: {
            console.error(`command "${command}" is not recognized`)
        }
    }

}

await main(argv)

